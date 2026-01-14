import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FolderEntity } from "../../entities/folder.entity";
import { TaskListEntity } from "../../entities/tasklist.entity";
import { CreateFolderDto } from "./dto/create-folder.dto";
import { UpdateFolderDto } from "./dto/update-folder.dto";
import { ClsService } from "nestjs-cls";
import { ActivityLogService } from "../activity-log/activity-log.service";
import { ActivityType } from "../../entities/activity-log.entity";

@Injectable()
export class FolderService {
	constructor(
		@InjectRepository(FolderEntity)
		private folderRepo: Repository<FolderEntity>,
		@InjectRepository(TaskListEntity)
		private taskListRepo: Repository<TaskListEntity>,
		private cls: ClsService,
		private activityLogService: ActivityLogService
	) { }

	async create(ownerId: number, dto: CreateFolderDto) {
		const folder = this.folderRepo.create({
			name: dto.name,
			description: dto.description,
			spaceId: dto.spaceId,
			ownerId
		})
		const savedFolder = await this.folderRepo.save(folder)

		const defaultList = this.taskListRepo.create({
			name: 'Siyahı',
			folderId: savedFolder.id,
			spaceId: dto.spaceId
		})
		const savedDefaultList = await this.taskListRepo.save(defaultList)

		await this.activityLogService.log(
			ActivityType.FOLDER_CREATE,
			savedFolder.id,
			savedFolder.name,
			`"${savedFolder.name}" qovluğu yaradıldı`
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
			defaultListId: savedDefaultList.id
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

	async getFullDetails(id: number, search?: string) {
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

		const allTasks: any[] = []
		taskLists.forEach(list => {
			allTasks.push(...list.tasks.map(t => ({ ...t, listName: list.name })))
		})

		if (search) {
			const searchLower = search.toLowerCase()
			const filteredLists = taskLists.filter(l => l.name.toLowerCase().includes(searchLower))
			const filteredTasks = allTasks.filter(t => t.title?.toLowerCase().includes(searchLower) || t.description?.toLowerCase().includes(searchLower))
			return {
				...folder,
				taskLists: filteredLists,
				allTasks: filteredTasks
			}
		}

		return {
			...folder,
			taskLists,
			allTasks
		}
	}

	async updateFolder(id: number, userId: number, dto: UpdateFolderDto) {
		const folder = await this.folderRepo.findOne({ where: { id } })

		if (!folder) throw new NotFoundException('Qovluq tapılmadı!')

		const user = this.cls.get('user')
		if (user.role !== 'admin' && folder.ownerId !== userId) {
			throw new UnauthorizedException('Qovluğu yeniləmək üçün icazəniz yoxdur!')
		}

		const oldName = folder.name
		Object.assign(folder, dto)
		await this.folderRepo.save(folder)

		await this.activityLogService.log(
			ActivityType.FOLDER_UPDATE,
			id,
			folder.name,
			`"${oldName}" qovluğu yeniləndi`,
			{ ...dto }
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

