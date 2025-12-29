import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SpaceEntity } from "../../entities/space.entity";
import { TaskEntity } from "../../entities/task.entity";
import { CreateSpaceDto } from "./dto/create-space.dto";
import { UpdateSpaceDto } from "./dto/update-space.dto";
import { ClsService } from "nestjs-cls";
import { ActivityLogService } from "../activity-log/activity-log.service";
import { ActivityType } from "../../entities/activity-log.entity";

@Injectable()
export class SpaceService {
	constructor(
		@InjectRepository(SpaceEntity)
		private spaceRepo: Repository<SpaceEntity>,
		@InjectRepository(TaskEntity)
		private taskRepo: Repository<TaskEntity>,
		private cls: ClsService,
		private activityLogService: ActivityLogService
	) { }

	async create(ownerId: number, dto: CreateSpaceDto) {
		const space = this.spaceRepo.create({ ...dto, ownerId })
		const savedSpace = await this.spaceRepo.save(space)

		await this.activityLogService.log(
			ActivityType.SPACE_CREATE,
			savedSpace.id,
			savedSpace.name,
			`"${savedSpace.name}" sahəsi yaradıldı`
		)

		return savedSpace
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
			return await this.spaceRepo.find({
				order: { createdAt: 'DESC' },
				relations: ['folders', 'folders.taskLists', 'taskLists']
			})
		}

		// User yalnız assign edildiyi task-ların olduğu space-ləri görür
		const assignedSpaceIds = await this.taskRepo
			.createQueryBuilder('task')
			.innerJoin('task.assignees', 'assignee', 'assignee.id = :userId', { userId: ownerId })
			.innerJoin('task.taskList', 'taskList')
			.leftJoin('taskList.folder', 'folder')
			.leftJoin('taskList.space', 'directSpace')
			.leftJoin('folder.space', 'folderSpace')
			.select('DISTINCT COALESCE(directSpace.id, folderSpace.id)', 'spaceId')
			.getRawMany()

		const spaceIds = assignedSpaceIds
			.map(r => r.spaceId)
			.filter(id => id !== null)

		if (spaceIds.length === 0) {
			return []
		}

		return await this.spaceRepo
			.createQueryBuilder('space')
			.leftJoinAndSelect('space.folders', 'folders')
			.leftJoinAndSelect('folders.taskLists', 'folderTaskLists')
			.leftJoinAndSelect('space.taskLists', 'taskLists')
			.where('space.id IN (:...spaceIds)', { spaceIds })
			.orderBy('space.createdAt', 'DESC')
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

	async getFullDetails(id: number, search?: string) {
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

		const allTasks: any[] = []
		folders.forEach(folder => {
			folder.taskLists.forEach(list => {
				allTasks.push(...list.tasks.map(t => ({ ...t, listName: list.name, folderName: folder.name })))
			})
		})
		directLists.forEach(list => {
			allTasks.push(...list.tasks.map(t => ({ ...t, listName: list.name, folderName: null })))
		})

		if (search) {
			const searchLower = search.toLowerCase()
			const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(searchLower))
			const filteredLists = directLists.filter(l => l.name.toLowerCase().includes(searchLower))
			const filteredTasks = allTasks.filter(t => t.title?.toLowerCase().includes(searchLower) || t.description?.toLowerCase().includes(searchLower))
			return {
				...space,
				folders: filteredFolders,
				directLists: filteredLists,
				allTasks: filteredTasks
			}
		}

		return {
			...space,
			folders,
			directLists,
			allTasks
		}
	}

	async updateSpace(id: number, userId: number, dto: UpdateSpaceDto) {
		const space = await this.spaceRepo.findOne({ where: { id } })

		if (!space) throw new NotFoundException('Sahə tapılmadı!')

		const user = this.cls.get('user')
		if (user?.role !== 'admin' && space.ownerId !== userId) {
			throw new UnauthorizedException('Sahəni yeniləmək üçün icazəniz yoxdur!')
		}

		const oldName = space.name
		Object.assign(space, dto)
		await this.spaceRepo.save(space)

		await this.activityLogService.log(
			ActivityType.SPACE_UPDATE,
			id,
			space.name,
			`"${oldName}" sahəsi yeniləndi`,
			{ ...dto }
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
}
