import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { TaskListEntity } from "../../entities/tasklist.entity";
import { CreateTaskListDto } from "./dto/create-tasklist.dto";
import { UpdateTaskListDto } from "./dto/update-tasklist.dto";
import { FilterTaskListDto } from "./dto/filter-tasklist.dto";
import { ClsService } from "nestjs-cls";
import { ActivityLogService } from "../activity-log/activity-log.service";
import { ActivityType } from "../../entities/activity-log.entity";

@Injectable()
export class TaskListService {
	constructor(
		@InjectRepository(TaskListEntity)
		private taskListRepo: Repository<TaskListEntity>,
		private cls: ClsService,
		private activityLogService: ActivityLogService
	) { }

	async create(dto: CreateTaskListDto): Promise<TaskListEntity> {
		if (!dto.folderId && !dto.spaceId) {
			throw new BadRequestException('folderId və ya spaceId lazımdır')
		}

		const list = new TaskListEntity()
		list.name = dto.name
		list.folderId = dto.folderId || null
		list.spaceId = dto.spaceId || null

		const savedList = await this.taskListRepo.save(list)

		await this.activityLogService.log(
			ActivityType.LIST_CREATE,
			savedList.id,
			savedList.name,
			`"${savedList.name}" siyahısı yaradıldı`
		)

		return savedList
	}

	async listBySpace(spaceId: number) {
		return await this.taskListRepo.find({
			where: { spaceId, folderId: IsNull() },
			order: { createdAt: 'DESC' },
			relations: ['tasks']
		})
	}

	async listByFolder(folderId: number, filters?: FilterTaskListDto) {
		const queryBuilder = this.taskListRepo.createQueryBuilder('taskList')
			.leftJoinAndSelect('taskList.tasks', 'task')
			.where('taskList.folderId = :folderId', { folderId })

		if (filters?.search) {
			queryBuilder.andWhere(
				'(taskList.name ILIKE :search OR task.title ILIKE :search OR task.description ILIKE :search)',
				{ search: `%${filters.search}%` }
			)
		}

		if (filters?.startDate) {
			queryBuilder.andWhere('task.startAt >= :startDate', { startDate: filters.startDate })
		}

		if (filters?.endDate) {
			queryBuilder.andWhere('task.startAt <= :endDate', { endDate: filters.endDate })
		}

		return await queryBuilder
			.orderBy('taskList.createdAt', 'DESC')
			.addOrderBy('task.order', 'ASC')
			.getMany()
	}

	async updateTaskList(id: number, dto: UpdateTaskListDto) {
		const taskList = await this.taskListRepo.findOne({
			where: { id },
			relations: ['folder', 'space']
		})

		if (!taskList) throw new NotFoundException('Siyahı tapılmadı')

		const user = this.cls.get('user')
		const ownerId = taskList.folder?.ownerId || taskList.space?.ownerId
		if (user.role !== 'admin' && ownerId !== user.id) {
			throw new UnauthorizedException('Siyahını yeniləmək üçün icazəniz yoxdur')
		}

		const oldName = taskList.name
		Object.assign(taskList, dto)
		await this.taskListRepo.save(taskList)

		await this.activityLogService.log(
			ActivityType.LIST_UPDATE,
			id,
			taskList.name,
			`"${oldName}" siyahısı yeniləndi`,
			{ ...dto }
		)

		return { message: "Siyahı uğurla yeniləndi" }
	}

	async deleteTaskList(id: number) {
		const taskList = await this.taskListRepo.findOne({
			where: { id },
			relations: ['folder', 'space']
		})

		if (!taskList) throw new NotFoundException('Siyahı tapılmadı')

		const user = this.cls.get('user')
		const ownerId = taskList.folder?.ownerId || taskList.space?.ownerId
		if (user.role !== 'admin' && ownerId !== user.id) {
			throw new UnauthorizedException('Siyahını silmək üçün icazəniz yoxdur')
		}

		await this.taskListRepo.softDelete({ id })

		await this.activityLogService.log(
			ActivityType.LIST_DELETE,
			id,
			taskList.name,
			`"${taskList.name}" siyahısı silindi`
		)

		return { message: "Siyahı uğurla silindi" }
	}
}
