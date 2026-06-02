import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SpaceEntity } from "../../entities/space.entity";
import { TaskEntity } from "../../entities/task.entity";
import { TaskListEntity } from "../../entities/tasklist.entity";
import { UserEntity } from "../../entities/user.entity";
import { CreateSpaceDto } from "./dto/create-space.dto";
import { UpdateSpaceDto } from "./dto/update-space.dto";
import { ClsService } from "nestjs-cls";
import { ActivityLogService } from "../activity-log/activity-log.service";
import { ActivityType } from "../../entities/activity-log.entity";
import { NotificationService } from "../notification/notification.service";
import { NotificationType } from "../../entities/notification.entity";
import { AssigneeDefaultsService } from "../../shared/services/assignee-defaults.service";
import { FilterSpaceDetailsDto } from "./dto/filter-space-details.dto";
import { taskMatchesTaskDateFilters } from "../../shared/utils/filter-date.utils";

@Injectable()
export class SpaceService {
	constructor(
		@InjectRepository(SpaceEntity)
		private spaceRepo: Repository<SpaceEntity>,
		@InjectRepository(TaskEntity)
		private taskRepo: Repository<TaskEntity>,
		@InjectRepository(TaskListEntity)
		private taskListRepo: Repository<TaskListEntity>,
		private assigneeDefaults: AssigneeDefaultsService,
		private cls: ClsService,
		private activityLogService: ActivityLogService,
		private notificationService: NotificationService
	) { }

	async create(ownerId: number, dto: CreateSpaceDto) {
		const assigneeIds = await this.assigneeDefaults.mergeResourceAssignees(dto.assigneeIds, ownerId)
		const space = this.spaceRepo.create({ ...dto, ownerId })
		space.assignees = assigneeIds.map((id) => ({ id } as UserEntity))

		const savedSpace = await this.spaceRepo.save(space)

		// Default list yarat (folder yox) — eyni assignee-lər (yaradan + adminlər + ...)
		const defaultList = this.taskListRepo.create({
			name: 'Siyahı',
			spaceId: savedSpace.id,
			folderId: null,
			assignees: assigneeIds.map((id) => ({ id } as UserEntity)),
		})
		const savedDefaultList = await this.taskListRepo.save(defaultList)

		for (const userId of assigneeIds) {
			if (userId !== ownerId) {
				await this.notificationService.createNotification({
					userId,
					type: NotificationType.SPACE_ASSIGNED,
					title: 'Space-ə əlavə edildiniz',
					message: `"${savedSpace.name}" space-inə əlavə edildiniz`,
					spaceId: savedSpace.id
				})
			}
		}

		await this.activityLogService.log(
			ActivityType.SPACE_CREATE,
			savedSpace.id,
			savedSpace.name,
			`"${savedSpace.name}" sahəsi yaradıldı`,
			assigneeIds.length ? { assignees: assigneeIds } : undefined
		)

		// Space-i taskLists ilə birlikdə qaytar
		return {
			...savedSpace,
			taskLists: [savedDefaultList],
			folders: []
		}
	}

	async listAll() {
		return await this.spaceRepo.find({
			order: { createdAt: 'DESC' },
			relations: ['folders', 'taskLists']
		})
	}

	async listByOwner(ownerId: number) {
		const user = this.cls.get('user')

		// Admin bütün space-ləri görür
		if (user?.role === 'admin') {
			return await this.spaceRepo
				.createQueryBuilder('space')
				.leftJoinAndSelect('space.assignees', 'spaceAssignees')
				.leftJoinAndSelect('space.folders', 'folders', 'folders.isArchived = false AND folders.deletedAt IS NULL')
				.leftJoinAndSelect('folders.assignees', 'folderAssignees')
				.leftJoinAndSelect('folders.taskLists', 'folderTaskLists', 'folderTaskLists.isArchived = false AND folderTaskLists.deletedAt IS NULL')
				.leftJoinAndSelect('folderTaskLists.assignees', 'folderTaskListAssignees')
				.leftJoinAndSelect('space.taskLists', 'taskLists', 'taskLists.isArchived = false AND taskLists.deletedAt IS NULL AND taskLists.folderId IS NULL')
				.leftJoinAndSelect('taskLists.assignees', 'taskListAssignees')
				.where('space.isArchived = false')
				.andWhere('space.deletedAt IS NULL')
				.orderBy('space.order', 'ASC')
				.addOrderBy('folders.order', 'ASC')
				.addOrderBy('folderTaskLists.order', 'ASC')
				.addOrderBy('taskLists.order', 'ASC')
				.getMany()
		}

		// User-in özünün yaratdığı space-ləri tap
		const ownedSpaceIds = await this.spaceRepo
			.createQueryBuilder('space')
			.where('space.ownerId = :ownerId', { ownerId })
			.andWhere('space.isArchived = false')
			.andWhere('space.deletedAt IS NULL')
			.select('space.id')
			.getRawMany()

		// User-in assign edildiği space-ləri tap
		const spaceAssignedIds = await this.spaceRepo
			.createQueryBuilder('space')
			.innerJoin('space.assignees', 'assignee', 'assignee.id = :userId', { userId: ownerId })
			.andWhere('space.isArchived = false')
			.andWhere('space.deletedAt IS NULL')
			.select('space.id')
			.getRawMany()

		// User-in assign edildiyi task-ların space-lərini tap
		const assignedSpaceIds = await this.taskRepo
			.createQueryBuilder('task')
			.innerJoin('task.assignees', 'assignee', 'assignee.id = :userId', { userId: ownerId })
			.innerJoin('task.taskList', 'taskList')
			.leftJoin('taskList.folder', 'folder')
			.leftJoin('taskList.space', 'directSpace')
			.leftJoin('folder.space', 'folderSpace')
			.where('task.deletedAt IS NULL')
			.andWhere('task.isArchived = false')
			.select('DISTINCT COALESCE(directSpace.id, folderSpace.id)', 'spaceId')
			.getRawMany()

		// User-in assign edildiyi list-lərin space-lərini tap
		const listAssignedSpaceIds = await this.taskListRepo
			.createQueryBuilder('taskList')
			.innerJoin('taskList.assignees', 'assignee', 'assignee.id = :userId', { userId: ownerId })
			.leftJoin('taskList.folder', 'folder')
			.leftJoin('taskList.space', 'directSpace')
			.leftJoin('folder.space', 'folderSpace')
			.where('taskList.deletedAt IS NULL')
			.andWhere('taskList.isArchived = false')
			.select('DISTINCT COALESCE(directSpace.id, folderSpace.id)', 'spaceId')
			.getRawMany()

		// User-in assign edildiyi folder-lərin space-lərini tap
		const folderAssignedSpaceIds = await this.spaceRepo
			.createQueryBuilder('space')
			.innerJoin('space.folders', 'folder')
			.innerJoin('folder.assignees', 'assignee', 'assignee.id = :userId', { userId: ownerId })
			.where('folder.deletedAt IS NULL')
			.andWhere('folder.isArchived = false')
			.andWhere('space.deletedAt IS NULL')
			.andWhere('space.isArchived = false')
			.select('DISTINCT space.id', 'spaceId')
			.getRawMany()

		// Bütün mənbələrdən space ID-lərini birləşdir
		const allSpaceIds = [
			...ownedSpaceIds.map(r => r.space_id),
			...spaceAssignedIds.map(r => r.space_id),
			...assignedSpaceIds.map(r => r.spaceId),
			...listAssignedSpaceIds.map(r => r.spaceId),
			...folderAssignedSpaceIds.map(r => r.spaceId)
		].filter(id => id !== null)

		// Unique ID-lər
		const uniqueSpaceIds = [...new Set(allSpaceIds)]

		if (uniqueSpaceIds.length === 0) {
			return []
		}

		return await this.spaceRepo
			.createQueryBuilder('space')
			.leftJoinAndSelect('space.assignees', 'spaceAssignees')
			.leftJoinAndSelect('space.folders', 'folders', 'folders.isArchived = false AND folders.deletedAt IS NULL')
			.leftJoinAndSelect('folders.assignees', 'folderAssignees')
			.leftJoinAndSelect('folders.taskLists', 'folderTaskLists', 'folderTaskLists.isArchived = false AND folderTaskLists.deletedAt IS NULL')
			.leftJoinAndSelect('folderTaskLists.assignees', 'folderTaskListAssignees')
			.leftJoinAndSelect('space.taskLists', 'taskLists', 'taskLists.isArchived = false AND taskLists.deletedAt IS NULL AND taskLists.folderId IS NULL')
			.leftJoinAndSelect('taskLists.assignees', 'taskListAssignees')
			.where('space.id IN (:...spaceIds)', { spaceIds: uniqueSpaceIds })
			.andWhere('space.isArchived = false')
			.andWhere('space.deletedAt IS NULL')
			.orderBy('space.order', 'ASC')
			.addOrderBy('folders.order', 'ASC')
			.addOrderBy('folderTaskLists.order', 'ASC')
			.addOrderBy('taskLists.order', 'ASC')
			.getMany()
	}

	async getOne(id: number) {
		const space = await this.spaceRepo.findOne({
			where: { id },
			relations: ['folders', 'folders.taskLists', 'taskLists']
		})

		if (!space) throw new NotFoundException('Sahə tapılmadı!')

		return space
	}

	private taskMatchesFilters(task: { title?: string; description?: string; statusId?: number | null; startAt?: Date | string | null; dueAt?: Date | string | null; assignees?: { id: number }[] }, filters: FilterSpaceDetailsDto): boolean {
		if (filters.search) {
			const searchLower = filters.search.toLowerCase()
			const titleMatch = task.title?.toLowerCase().includes(searchLower)
			const descMatch = task.description?.toLowerCase().includes(searchLower)
			if (!titleMatch && !descMatch) return false
		}

		if (filters.statusId) {
			if (task.statusId !== parseInt(filters.statusId, 10)) return false
		}

		if (filters.assigneeId) {
			const assigneeIds = task.assignees?.map((a) => a.id) || []
			if (!assigneeIds.includes(parseInt(filters.assigneeId, 10))) return false
		}

		if (!taskMatchesTaskDateFilters(task, filters.startDate, filters.endDate)) {
			return false
		}

		return true
	}

	private hasActiveTaskFilters(filters?: FilterSpaceDetailsDto): boolean {
		if (!filters) return false
		return !!(filters.search || filters.statusId || filters.assigneeId || filters.startDate || filters.endDate)
	}

	private applyListFilters(
		taskLists: { id: number; name: string; tasks: any[] }[],
		filters?: FilterSpaceDetailsDto
	) {
		if (!this.hasActiveTaskFilters(filters)) {
			const allTasks: any[] = []
			taskLists.forEach((list) => {
				allTasks.push(...list.tasks.map((t) => ({ ...t, listName: list.name })))
			})
			return { taskLists, allTasks }
		}

		const searchLower = filters?.search?.toLowerCase()
		const filteredLists: typeof taskLists = []
		const allTasks: any[] = []

		for (const list of taskLists) {
			const listNameMatches = searchLower ? list.name.toLowerCase().includes(searchLower) : false
			const onlySearchFilter = filters?.search && !filters.statusId && !filters.assigneeId && !filters.startDate && !filters.endDate

			let tasks = list.tasks
			if (listNameMatches && onlySearchFilter) {
				// Siyahı adı uyğun gəlirsə, digər filtr yoxdursa bütün tapşırıqları göstər
			} else {
				tasks = list.tasks.filter((t) => this.taskMatchesFilters(t, filters!))
			}

			const includeList = listNameMatches || tasks.length > 0
			if (includeList) {
				filteredLists.push({ ...list, tasks })
				allTasks.push(...tasks.map((t) => ({ ...t, listName: list.name })))
			}
		}

		return { taskLists: filteredLists, allTasks }
	}

	async getFullDetails(id: number, filters?: FilterSpaceDetailsDto) {
		const space = await this.spaceRepo.findOne({
			where: { id, isArchived: false },
			relations: ['folders', 'folders.taskLists', 'folders.taskLists.tasks', 'folders.taskLists.tasks.assignees', 'folders.taskLists.tasks.status', 'taskLists', 'taskLists.tasks', 'taskLists.tasks.assignees', 'taskLists.tasks.status']
		})

		if (!space) throw new NotFoundException('Sahə tapılmadı!')

		const folders = space.folders
			?.filter(f => !f.isArchived && !f.deletedAt)
			?.map(folder => ({
				...folder,
				taskLists: folder.taskLists
					?.filter(l => !l.isArchived && !l.deletedAt)
					?.map(list => ({
						...list,
						tasks: list.tasks?.filter(t => !t.isArchived && !t.deletedAt) || []
					})) || []
			})) || []

		const directLists = space.taskLists
			?.filter(l => !l.folderId && !l.isArchived && !l.deletedAt)
			?.map(list => ({
				...list,
				tasks: list.tasks?.filter(t => !t.isArchived && !t.deletedAt) || []
			})) || []

		if (!this.hasActiveTaskFilters(filters)) {
			const allTasks: any[] = []
			folders.forEach(folder => {
				folder.taskLists.forEach(list => {
					allTasks.push(...list.tasks.map(t => ({ ...t, listName: list.name, folderName: folder.name })))
				})
			})
			directLists.forEach(list => {
				allTasks.push(...list.tasks.map(t => ({ ...t, listName: list.name, folderName: null })))
			})
			return { ...space, folders, directLists, allTasks }
		}

		const searchLower = filters?.search?.toLowerCase()
		const onlySearchFilter = filters?.search && !filters.statusId && !filters.assigneeId && !filters.startDate && !filters.endDate
		const filteredFolders: any[] = []
		const allTasks: any[] = []

		for (const folder of folders) {
			const folderNameMatches = searchLower ? folder.name.toLowerCase().includes(searchLower) : false

			if (folderNameMatches && onlySearchFilter) {
				filteredFolders.push(folder)
				folder.taskLists.forEach(list => {
					allTasks.push(...list.tasks.map(t => ({ ...t, listName: list.name, folderName: folder.name })))
				})
				continue
			}

			const { taskLists: filteredLists, allTasks: folderListTasks } = this.applyListFilters(folder.taskLists, filters)
			if (filteredLists.length > 0) {
				filteredFolders.push({ ...folder, taskLists: filteredLists })
				allTasks.push(...folderListTasks.map(t => ({ ...t, folderName: folder.name })))
			}
		}

		const { taskLists: filteredDirectLists, allTasks: directTasks } = this.applyListFilters(directLists, filters)
		allTasks.push(...directTasks.map(t => ({ ...t, folderName: null })))

		return {
			...space,
			folders: filteredFolders,
			directLists: filteredDirectLists,
			allTasks
		}
	}

	async updateSpace(id: number, userId: number, dto: UpdateSpaceDto) {
		const space = await this.spaceRepo.findOne({
			where: { id },
			relations: ['assignees']
		})

		if (!space) throw new NotFoundException('Sahə tapılmadı!')

		const user = this.cls.get('user')
		if (user?.role !== 'admin' && space.ownerId !== userId) {
			throw new UnauthorizedException('Sahəni yeniləmək üçün icazəniz yoxdur!')
		}

		const oldName = space.name
		const changes: Record<string, any> = {}

		// Assignee dəyişikliklərini izlə
		if (dto.assigneeIds !== undefined) {
			const oldAssigneeIds = space.assignees?.map(u => u.id) || []
			const newAssigneeIds = dto.assigneeIds || []

			const addedUserIds = newAssigneeIds.filter(id => !oldAssigneeIds.includes(id))
			const removedUserIds = oldAssigneeIds.filter(id => !newAssigneeIds.includes(id))

			// Yeni əlavə edilənlərə notification
			for (const assigneeId of addedUserIds) {
				await this.notificationService.createNotification({
					userId: assigneeId,
					type: NotificationType.SPACE_ASSIGNED,
					title: 'Space-ə əlavə edildiniz',
					message: `"${space.name}" space-inə əlavə edildiniz`,
					spaceId: space.id
				})
			}

			// Çıxarılanlara notification
			for (const assigneeId of removedUserIds) {
				await this.notificationService.createNotification({
					userId: assigneeId,
					type: NotificationType.SPACE_UNASSIGNED,
					title: 'Space-dən çıxarıldınız',
					message: `"${space.name}" space-indən çıxarıldınız`,
					spaceId: space.id
				})
			}

			if (addedUserIds.length || removedUserIds.length) {
				changes.assignees = { added: addedUserIds, removed: removedUserIds }
			}

			space.assignees = newAssigneeIds.map(id => ({ id } as UserEntity))
		}

		if (dto.name) changes.name = { old: oldName, new: dto.name }
		if (dto.description !== undefined) changes.description = dto.description

		Object.assign(space, { name: dto.name, description: dto.description })
		await this.spaceRepo.save(space)

		await this.activityLogService.log(
			ActivityType.SPACE_UPDATE,
			id,
			space.name,
			`"${oldName}" sahəsi yeniləndi`,
			changes
		)

		return { message: "Sahə uğurla yeniləndi" }
	}

	async deleteSpace(id: number, userId: number) {
		const space = await this.spaceRepo.findOne({ where: { id } })

		if (!space) throw new NotFoundException('Sahə tapılmadı!')

		const user = this.cls.get('user')
		if (user?.role !== 'admin' && space.ownerId !== userId) {
			throw new UnauthorizedException('Sahəni silmək üçün icazəniz yoxdur!')
		}

		await this.spaceRepo.softDelete({ id })

		await this.activityLogService.log(
			ActivityType.SPACE_DELETE,
			id,
			space.name,
			`"${space.name}" sahəsi silindi`
		)

		return { message: "Sahə uğurla silindi" }
	}

	async reorderSpaces(spaceIds: number[]) {
		for (let i = 0; i < spaceIds.length; i++) {
			await this.spaceRepo.update(spaceIds[i], { order: i })
		}
		return { message: "Sıralama yeniləndi" }
	}
}
