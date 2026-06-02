import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FolderEntity } from "../../entities/folder.entity";
import { TaskListEntity } from "../../entities/tasklist.entity";
import { UserEntity } from "../../entities/user.entity";
import { CreateFolderDto } from "./dto/create-folder.dto";
import { UpdateFolderDto } from "./dto/update-folder.dto";
import { ClsService } from "nestjs-cls";
import { ActivityLogService } from "../activity-log/activity-log.service";
import { ActivityType } from "../../entities/activity-log.entity";
import { NotificationService } from "../notification/notification.service";
import { NotificationType } from "../../entities/notification.entity";
import { AssigneeDefaultsService } from "../../shared/services/assignee-defaults.service";
import { FilterFolderDetailsDto } from "./dto/filter-folder-details.dto";
import { taskMatchesTaskDateFilters } from "../../shared/utils/filter-date.utils";

@Injectable()
export class FolderService {
	constructor(
		@InjectRepository(FolderEntity)
		private folderRepo: Repository<FolderEntity>,
		@InjectRepository(TaskListEntity)
		private taskListRepo: Repository<TaskListEntity>,
		private assigneeDefaults: AssigneeDefaultsService,
		private cls: ClsService,
		private activityLogService: ActivityLogService,
		private notificationService: NotificationService
	) { }

	async create(ownerId: number, dto: CreateFolderDto) {
		const assigneeIds = await this.assigneeDefaults.mergeResourceAssignees(dto.assigneeIds, ownerId)
		const folder = this.folderRepo.create({
			name: dto.name,
			description: dto.description,
			spaceId: dto.spaceId,
			ownerId
		})
		folder.assignees = assigneeIds.map((id) => ({ id } as UserEntity))

		const savedFolder = await this.folderRepo.save(folder)

		for (const userId of assigneeIds) {
			if (userId !== ownerId) {
				await this.notificationService.createNotification({
					userId,
					type: NotificationType.FOLDER_ASSIGNED,
					title: 'Qovluğa əlavə edildiniz',
					message: `"${savedFolder.name}" qovluğuna əlavə edildiniz`,
					folderId: savedFolder.id
				})
			}
		}

		const defaultList = this.taskListRepo.create({
			name: 'Siyahı',
			folderId: savedFolder.id,
			spaceId: null,
			assignees: assigneeIds.map((id) => ({ id } as UserEntity)),
		})
		const savedDefaultList = await this.taskListRepo.save(defaultList)

		await this.activityLogService.log(
			ActivityType.FOLDER_CREATE,
			savedFolder.id,
			savedFolder.name,
			`"${savedFolder.name}" qovluğu yaradıldı`,
			assigneeIds.length ? { assignees: assigneeIds } : undefined
		)

		// Return folder with default list as plain object
		return {
			id: savedFolder.id,
			name: savedFolder.name,
			description: savedFolder.description,
			spaceId: savedFolder.spaceId,
			ownerId: savedFolder.ownerId,
			createdAt: savedFolder.createdAt,
			updatedAt: savedFolder.updatedAt,
			taskLists: [savedDefaultList],
			defaultListId: savedDefaultList.id,
			assignees: savedFolder.assignees || []
		}
	}

	async listAll() {
		return await this.folderRepo.find({ order: { order: 'ASC' } })
	}

	async listByOwner(ownerId: number) {
		return await this.folderRepo.find({ where: { ownerId }, order: { order: 'ASC' } })
	}

	async listBySpace(spaceId: number) {
		return await this.folderRepo.find({
			where: { spaceId },
			order: { order: 'ASC' },
			relations: ['taskLists']
		})
	}

	private taskMatchesFilters(task: { title?: string; description?: string; statusId?: number | null; startAt?: Date | string | null; dueAt?: Date | string | null; assignees?: { id: number }[] }, filters: FilterFolderDetailsDto): boolean {
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

	private hasActiveTaskFilters(filters?: FilterFolderDetailsDto): boolean {
		if (!filters) return false
		return !!(filters.search || filters.statusId || filters.assigneeId || filters.startDate || filters.endDate)
	}

	private applyFolderFilters(
		taskLists: { id: number; name: string; tasks: any[] }[],
		filters?: FilterFolderDetailsDto
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

	async getFullDetails(id: number, filters?: FilterFolderDetailsDto) {
		const folder = await this.folderRepo.findOne({
			where: { id, isArchived: false },
			relations: ['taskLists', 'taskLists.tasks', 'taskLists.tasks.assignees', 'taskLists.tasks.status', 'space']
		})

		if (!folder) throw new NotFoundException('Qovluq tapılmadı!')

		const taskLists = folder.taskLists
			?.filter(l => !l.isArchived && !l.deletedAt)
			?.map(list => ({
				...list,
				tasks: list.tasks?.filter(t => !t.isArchived && !t.deletedAt) || []
			})) || []

		const { taskLists: filteredLists, allTasks } = this.applyFolderFilters(taskLists, filters)

		return {
			...folder,
			taskLists: filteredLists,
			allTasks
		}
	}

	async updateFolder(id: number, userId: number, dto: UpdateFolderDto) {
		const folder = await this.folderRepo.findOne({
			where: { id },
			relations: ['assignees']
		})

		if (!folder) throw new NotFoundException('Qovluq tapılmadı!')

		const user = this.cls.get('user')
		if (user.role !== 'admin' && folder.ownerId !== userId) {
			throw new UnauthorizedException('Qovluğu yeniləmək üçün icazəniz yoxdur!')
		}

		const oldName = folder.name
		const changes: Record<string, any> = {}

		// Assignee dəyişikliklərini izlə
		if (dto.assigneeIds !== undefined) {
			const oldAssigneeIds = folder.assignees?.map(u => u.id) || []
			const newAssigneeIds = dto.assigneeIds || []

			const addedUserIds = newAssigneeIds.filter(id => !oldAssigneeIds.includes(id))
			const removedUserIds = oldAssigneeIds.filter(id => !newAssigneeIds.includes(id))

			// Yeni əlavə edilənlərə notification
			for (const assigneeId of addedUserIds) {
				await this.notificationService.createNotification({
					userId: assigneeId,
					type: NotificationType.FOLDER_ASSIGNED,
					title: 'Qovluğa əlavə edildiniz',
					message: `"${folder.name}" qovluğuna əlavə edildiniz`,
					folderId: folder.id
				})
			}

			// Çıxarılanlara notification
			for (const assigneeId of removedUserIds) {
				await this.notificationService.createNotification({
					userId: assigneeId,
					type: NotificationType.FOLDER_UNASSIGNED,
					title: 'Qovluqdan çıxarıldınız',
					message: `"${folder.name}" qovluğundan çıxarıldınız`,
					folderId: folder.id
				})
			}

			if (addedUserIds.length || removedUserIds.length) {
				changes.assignees = { added: addedUserIds, removed: removedUserIds }
			}

			folder.assignees = newAssigneeIds.map(id => ({ id } as UserEntity))
		}

		if (dto.name) changes.name = { old: oldName, new: dto.name }
		if (dto.description !== undefined) changes.description = dto.description

		Object.assign(folder, { name: dto.name, description: dto.description })
		await this.folderRepo.save(folder)

		await this.activityLogService.log(
			ActivityType.FOLDER_UPDATE,
			id,
			folder.name,
			`"${oldName}" qovluğu yeniləndi`,
			changes
		)

		return { message: "Qovluq uğurla yeniləndi" }
	}

	async deleteFolder(id: number, userId: number) {
		const folder = await this.folderRepo.findOne({ where: { id } })

		if (!folder) throw new NotFoundException('Qovluq tapılmadı!')

		const user = this.cls.get('user')
		if (user.role !== 'admin' && folder.ownerId !== userId) {
			throw new UnauthorizedException('Qovluğu silmək üçün icazəniz yoxdur!')
		}

		// Set deletedById before soft delete
		folder.deletedById = user.id
		await this.folderRepo.save(folder)
		await this.folderRepo.softDelete({ id })

		await this.activityLogService.log(
			ActivityType.FOLDER_DELETE,
			id,
			folder.name,
			`"${folder.name}" qovluğu silindi`
		)

		return { message: "Qovluq uğurla silindi" }
	}

	async reorderFolders(spaceId: number, folderIds: number[]) {
		for (let i = 0; i < folderIds.length; i++) {
			await this.folderRepo.update(folderIds[i], { order: i })
		}
		return { message: "Sıralama yeniləndi" }
	}

	async moveFolder(id: number, targetSpaceId: number) {
		const folder = await this.folderRepo.findOne({ where: { id } })
		if (!folder) throw new NotFoundException('Qovluq tapılmadı!')

		const oldSpaceId = folder.spaceId
		folder.spaceId = targetSpaceId
		await this.folderRepo.save(folder)

		await this.taskListRepo.update({ folderId: id }, { spaceId: targetSpaceId })

		await this.activityLogService.log(
			ActivityType.FOLDER_UPDATE,
			id,
			folder.name,
			`"${folder.name}" qovluğu başqa sahəyə köçürüldü`,
			{ oldSpaceId, newSpaceId: targetSpaceId }
		)

		return { message: "Qovluq köçürüldü" }
	}
}

