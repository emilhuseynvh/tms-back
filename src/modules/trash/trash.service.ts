import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Not, IsNull } from "typeorm";
import { FolderEntity } from "../../entities/folder.entity";
import { TaskListEntity } from "../../entities/tasklist.entity";
import { TaskEntity } from "../../entities/task.entity";
import { ActivityLogService } from "../activity-log/activity-log.service";
import { ActivityType } from "../../entities/activity-log.entity";
import { ClsService } from "nestjs-cls";

@Injectable()
export class TrashService {
	constructor(
		@InjectRepository(FolderEntity)
		private folderRepo: Repository<FolderEntity>,
		@InjectRepository(TaskListEntity)
		private taskListRepo: Repository<TaskListEntity>,
		@InjectRepository(TaskEntity)
		private taskRepo: Repository<TaskEntity>,
		private activityLogService: ActivityLogService,
		private cls: ClsService
	) { }

	async getTrash() {
		const user = this.cls.get('user')
		const isAdmin = user.role === 'admin'

		const foldersQuery = this.folderRepo.createQueryBuilder('folder')
			.withDeleted()
			.leftJoinAndSelect('folder.owner', 'owner')
			.where('folder.deletedAt IS NOT NULL')

		const listsQuery = this.taskListRepo.createQueryBuilder('list')
			.withDeleted()
			.leftJoinAndSelect('list.folder', 'folder')
			.leftJoinAndSelect('folder.owner', 'owner')
			.where('list.deletedAt IS NOT NULL')

		const tasksQuery = this.taskRepo.createQueryBuilder('task')
			.withDeleted()
			.leftJoinAndSelect('task.taskList', 'taskList')
			.leftJoinAndSelect('taskList.folder', 'folder')
			.leftJoinAndSelect('folder.owner', 'owner')
			.where('task.deletedAt IS NOT NULL')

		if (!isAdmin) {
			foldersQuery.andWhere('folder.ownerId = :userId', { userId: user.id })
			listsQuery.andWhere('folder.ownerId = :userId', { userId: user.id })
			tasksQuery.andWhere('folder.ownerId = :userId', { userId: user.id })
		}

		const [folders, lists, tasks] = await Promise.all([
			foldersQuery.orderBy('folder.deletedAt', 'DESC').getMany(),
			listsQuery.orderBy('list.deletedAt', 'DESC').getMany(),
			tasksQuery.orderBy('task.deletedAt', 'DESC').getMany()
		])

		return { folders, lists, tasks }
	}

	async restoreFolder(id: number) {
		const user = this.cls.get('user')
		const folder = await this.folderRepo.createQueryBuilder('folder')
			.withDeleted()
			.where('folder.id = :id', { id })
			.andWhere('folder.deletedAt IS NOT NULL')
			.getOne()

		if (!folder) throw new NotFoundException('Qovluq tapılmadı!')

		if (user.role !== 'admin' && folder.ownerId !== user.id) {
			throw new ForbiddenException('Bu qovluğu bərpa etmək üçün icazəniz yoxdur!')
		}

		await this.folderRepo.restore(id)

		await this.activityLogService.log(
			ActivityType.FOLDER_RESTORE,
			id,
			folder.name,
			`"${folder.name}" qovluğu bərpa edildi`
		)

		return { message: 'Qovluq bərpa edildi!' }
	}

	async restoreList(id: number) {
		const user = this.cls.get('user')
		const list = await this.taskListRepo.createQueryBuilder('list')
			.withDeleted()
			.leftJoinAndSelect('list.folder', 'folder')
			.where('list.id = :id', { id })
			.andWhere('list.deletedAt IS NOT NULL')
			.getOne()

		if (!list) throw new NotFoundException('Siyahı tapılmadı!')

		if (user.role !== 'admin' && list.folder?.ownerId !== user.id) {
			throw new ForbiddenException('Bu siyahını bərpa etmək üçün icazəniz yoxdur!')
		}

		await this.taskListRepo.restore(id)

		await this.activityLogService.log(
			ActivityType.LIST_RESTORE,
			id,
			list.name,
			`"${list.name}" siyahısı bərpa edildi`
		)

		return { message: 'Siyahı bərpa edildi!' }
	}

	async restoreTask(id: number) {
		const user = this.cls.get('user')
		const task = await this.taskRepo.createQueryBuilder('task')
			.withDeleted()
			.leftJoinAndSelect('task.taskList', 'taskList')
			.leftJoinAndSelect('taskList.folder', 'folder')
			.where('task.id = :id', { id })
			.andWhere('task.deletedAt IS NOT NULL')
			.getOne()

		if (!task) throw new NotFoundException('Tapşırıq tapılmadı!')

		if (user.role !== 'admin' && task.taskList?.folder?.ownerId !== user.id) {
			throw new ForbiddenException('Bu tapşırığı bərpa etmək üçün icazəniz yoxdur!')
		}

		await this.taskRepo.restore(id)

		await this.activityLogService.log(
			ActivityType.TASK_RESTORE,
			id,
			task.title,
			`"${task.title}" tapşırığı bərpa edildi`
		)

		return { message: 'Tapşırıq bərpa edildi!' }
	}

	async permanentDeleteFolder(id: number) {
		const user = this.cls.get('user')
		const folder = await this.folderRepo.createQueryBuilder('folder')
			.withDeleted()
			.where('folder.id = :id', { id })
			.andWhere('folder.deletedAt IS NOT NULL')
			.getOne()

		if (!folder) throw new NotFoundException('Qovluq tapılmadı!')

		if (user.role !== 'admin' && folder.ownerId !== user.id) {
			throw new ForbiddenException('Bu qovluğu silmək üçün icazəniz yoxdur!')
		}

		await this.folderRepo.delete(id)
		return { message: 'Qovluq həmişəlik silindi!' }
	}

	async permanentDeleteList(id: number) {
		const user = this.cls.get('user')
		const list = await this.taskListRepo.createQueryBuilder('list')
			.withDeleted()
			.leftJoinAndSelect('list.folder', 'folder')
			.where('list.id = :id', { id })
			.andWhere('list.deletedAt IS NOT NULL')
			.getOne()

		if (!list) throw new NotFoundException('Siyahı tapılmadı!')

		if (user.role !== 'admin' && list.folder?.ownerId !== user.id) {
			throw new ForbiddenException('Bu siyahını silmək üçün icazəniz yoxdur!')
		}

		await this.taskListRepo.delete(id)
		return { message: 'Siyahı həmişəlik silindi!' }
	}

	async permanentDeleteTask(id: number) {
		const user = this.cls.get('user')
		const task = await this.taskRepo.createQueryBuilder('task')
			.withDeleted()
			.leftJoinAndSelect('task.taskList', 'taskList')
			.leftJoinAndSelect('taskList.folder', 'folder')
			.where('task.id = :id', { id })
			.andWhere('task.deletedAt IS NOT NULL')
			.getOne()

		if (!task) throw new NotFoundException('Tapşırıq tapılmadı!')

		if (user.role !== 'admin' && task.taskList?.folder?.ownerId !== user.id) {
			throw new ForbiddenException('Bu tapşırığı silmək üçün icazəniz yoxdur!')
		}

		await this.taskRepo.delete(id)
		return { message: 'Tapşırıq həmişəlik silindi!' }
	}
}
