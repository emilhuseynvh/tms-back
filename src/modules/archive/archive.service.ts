import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SpaceEntity } from "../../entities/space.entity";
import { FolderEntity } from "../../entities/folder.entity";
import { TaskListEntity } from "../../entities/tasklist.entity";
import { TaskEntity } from "../../entities/task.entity";
import { ClsService } from "nestjs-cls";

@Injectable()
export class ArchiveService {
	constructor(
		@InjectRepository(SpaceEntity)
		private spaceRepo: Repository<SpaceEntity>,
		@InjectRepository(FolderEntity)
		private folderRepo: Repository<FolderEntity>,
		@InjectRepository(TaskListEntity)
		private taskListRepo: Repository<TaskListEntity>,
		@InjectRepository(TaskEntity)
		private taskRepo: Repository<TaskEntity>,
		private cls: ClsService
	) { }

	async getArchive() {
		const user = this.cls.get('user')
		const isAdmin = user.role === 'admin'

		const spacesQuery = this.spaceRepo.createQueryBuilder('space')
			.leftJoinAndSelect('space.owner', 'owner')
			.leftJoinAndSelect('space.archivedBy', 'archivedBy')
			.where('space.isArchived = :isArchived', { isArchived: true })

		const foldersQuery = this.folderRepo.createQueryBuilder('folder')
			.leftJoinAndSelect('folder.owner', 'owner')
			.leftJoinAndSelect('folder.archivedBy', 'archivedBy')
			.leftJoinAndSelect('folder.space', 'space')
			.where('folder.isArchived = :isArchived', { isArchived: true })

		const listsQuery = this.taskListRepo.createQueryBuilder('list')
			.leftJoinAndSelect('list.folder', 'folder')
			.leftJoinAndSelect('list.space', 'space')
			.leftJoinAndSelect('folder.owner', 'folderOwner')
			.leftJoinAndSelect('space.owner', 'spaceOwner')
			.leftJoinAndSelect('list.archivedBy', 'archivedBy')
			.where('list.isArchived = :isArchived', { isArchived: true })

		const tasksQuery = this.taskRepo.createQueryBuilder('task')
			.leftJoinAndSelect('task.taskList', 'taskList')
			.leftJoinAndSelect('taskList.folder', 'folder')
			.leftJoinAndSelect('taskList.space', 'space')
			.leftJoinAndSelect('folder.owner', 'folderOwner')
			.leftJoinAndSelect('space.owner', 'spaceOwner')
			.leftJoinAndSelect('task.archivedBy', 'archivedBy')
			.where('task.isArchived = :isArchived', { isArchived: true })

		if (!isAdmin) {
			spacesQuery.andWhere('space.archivedById = :userId', { userId: user.id })
			foldersQuery.andWhere('folder.archivedById = :userId', { userId: user.id })
			listsQuery.andWhere('list.archivedById = :userId', { userId: user.id })
			tasksQuery.andWhere('task.archivedById = :userId', { userId: user.id })
		}

		const [spaces, folders, lists, tasks] = await Promise.all([
			spacesQuery.orderBy('space.archivedAt', 'DESC').getMany(),
			foldersQuery.orderBy('folder.archivedAt', 'DESC').getMany(),
			listsQuery.orderBy('list.archivedAt', 'DESC').getMany(),
			tasksQuery.orderBy('task.archivedAt', 'DESC').getMany()
		])

		return { spaces, folders, lists, tasks }
	}

	async archiveSpace(id: number) {
		const user = this.cls.get('user')
		const space = await this.spaceRepo.findOne({ where: { id } })

		if (!space) throw new NotFoundException('Sahə tapılmadı!')

		if (user.role !== 'admin' && space.ownerId !== user.id) {
			throw new ForbiddenException('Bu sahəni arxivləmək üçün icazəniz yoxdur!')
		}

		space.isArchived = true
		space.archivedAt = new Date()
		space.archivedById = user.id
		await this.spaceRepo.save(space)

		return { message: 'Sahə arxivləndi!' }
	}

	async unarchiveSpace(id: number) {
		const user = this.cls.get('user')
		const space = await this.spaceRepo.findOne({ where: { id, isArchived: true } })

		if (!space) throw new NotFoundException('Arxivdə sahə tapılmadı!')

		if (user.role !== 'admin' && space.archivedById !== user.id) {
			throw new ForbiddenException('Bu sahəni arxivdən çıxarmaq üçün icazəniz yoxdur!')
		}

		space.isArchived = false
		space.archivedAt = null
		space.archivedById = null
		await this.spaceRepo.save(space)

		return { message: 'Sahə arxivdən çıxarıldı!' }
	}

	async archiveFolder(id: number) {
		const user = this.cls.get('user')
		const folder = await this.folderRepo.findOne({ where: { id } })

		if (!folder) throw new NotFoundException('Qovluq tapılmadı!')

		if (user.role !== 'admin' && folder.ownerId !== user.id) {
			throw new ForbiddenException('Bu qovluğu arxivləmək üçün icazəniz yoxdur!')
		}

		folder.isArchived = true
		folder.archivedAt = new Date()
		folder.archivedById = user.id
		await this.folderRepo.save(folder)

		return { message: 'Qovluq arxivləndi!' }
	}

	async unarchiveFolder(id: number) {
		const user = this.cls.get('user')
		const folder = await this.folderRepo.findOne({ where: { id, isArchived: true } })

		if (!folder) throw new NotFoundException('Arxivdə qovluq tapılmadı!')

		if (user.role !== 'admin' && folder.archivedById !== user.id) {
			throw new ForbiddenException('Bu qovluğu arxivdən çıxarmaq üçün icazəniz yoxdur!')
		}

		folder.isArchived = false
		folder.archivedAt = null
		folder.archivedById = null
		await this.folderRepo.save(folder)

		return { message: 'Qovluq arxivdən çıxarıldı!' }
	}

	async archiveList(id: number) {
		const user = this.cls.get('user')
		const list = await this.taskListRepo.findOne({
			where: { id },
			relations: ['folder', 'space']
		})

		if (!list) throw new NotFoundException('Siyahı tapılmadı!')

		const ownerId = list.folder?.ownerId || list.space?.ownerId
		if (user.role !== 'admin' && ownerId !== user.id) {
			throw new ForbiddenException('Bu siyahını arxivləmək üçün icazəniz yoxdur!')
		}

		list.isArchived = true
		list.archivedAt = new Date()
		list.archivedById = user.id
		await this.taskListRepo.save(list)

		return { message: 'Siyahı arxivləndi!' }
	}

	async unarchiveList(id: number) {
		const user = this.cls.get('user')
		const list = await this.taskListRepo.findOne({ where: { id, isArchived: true } })

		if (!list) throw new NotFoundException('Arxivdə siyahı tapılmadı!')

		if (user.role !== 'admin' && list.archivedById !== user.id) {
			throw new ForbiddenException('Bu siyahını arxivdən çıxarmaq üçün icazəniz yoxdur!')
		}

		list.isArchived = false
		list.archivedAt = null
		list.archivedById = null
		await this.taskListRepo.save(list)

		return { message: 'Siyahı arxivdən çıxarıldı!' }
	}

	async archiveTask(id: number) {
		const user = this.cls.get('user')
		const task = await this.taskRepo.findOne({
			where: { id },
			relations: ['taskList', 'taskList.folder', 'taskList.space']
		})

		if (!task) throw new NotFoundException('Tapşırıq tapılmadı!')

		const ownerId = task.taskList?.folder?.ownerId || task.taskList?.space?.ownerId
		if (user.role !== 'admin' && ownerId !== user.id) {
			throw new ForbiddenException('Bu tapşırığı arxivləmək üçün icazəniz yoxdur!')
		}

		task.isArchived = true
		task.archivedAt = new Date()
		task.archivedById = user.id
		await this.taskRepo.save(task)

		return { message: 'Tapşırıq arxivləndi!' }
	}

	async unarchiveTask(id: number) {
		const user = this.cls.get('user')
		const task = await this.taskRepo.findOne({ where: { id, isArchived: true } })

		if (!task) throw new NotFoundException('Arxivdə tapşırıq tapılmadı!')

		if (user.role !== 'admin' && task.archivedById !== user.id) {
			throw new ForbiddenException('Bu tapşırığı arxivdən çıxarmaq üçün icazəniz yoxdur!')
		}

		task.isArchived = false
		task.archivedAt = null
		task.archivedById = null
		await this.taskRepo.save(task)

		return { message: 'Tapşırıq arxivdən çıxarıldı!' }
	}
}
