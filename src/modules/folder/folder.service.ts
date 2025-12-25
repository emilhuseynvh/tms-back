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
		const folder = this.folderRepo.create({ ...dto, ownerId })
		const savedFolder = await this.folderRepo.save(folder)

		const defaultList = this.taskListRepo.create({
			name: 'Siyahı',
			folderId: savedFolder.id
		})
		await this.taskListRepo.save(defaultList)

		await this.activityLogService.log(
			ActivityType.FOLDER_CREATE,
			savedFolder.id,
			savedFolder.name,
			`"${savedFolder.name}" qovluğu yaradıldı`
		)

		return savedFolder
	}

	async listAll() {
		return await this.folderRepo.find({ order: { createdAt: 'DESC' } })
	}

	async listByOwner(ownerId: number) {
		return await this.folderRepo.find({ where: { ownerId }, order: { createdAt: 'DESC' } })
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

		await this.folderRepo.softDelete({ id })

		await this.activityLogService.log(
			ActivityType.FOLDER_DELETE,
			id,
			folder.name,
			`"${folder.name}" qovluğu silindi`
		)

		return { message: "Qovluq uğurla silindi" }
	}
}

