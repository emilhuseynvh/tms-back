import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { TaskListEntity } from "../../entities/tasklist.entity";
import { UserEntity } from "../../entities/user.entity";
import { CreateTaskListDto } from "./dto/create-tasklist.dto";
import { UpdateTaskListDto } from "./dto/update-tasklist.dto";
import { FilterTaskListDto } from "./dto/filter-tasklist.dto";
import { ClsService } from "nestjs-cls";
import { ActivityLogService } from "../activity-log/activity-log.service";
import { ActivityType } from "../../entities/activity-log.entity";
import { NotificationService } from "../notification/notification.service";
import { NotificationType } from "../../entities/notification.entity";

@Injectable()
export class TaskListService {
	constructor(
		@InjectRepository(TaskListEntity)
		private taskListRepo: Repository<TaskListEntity>,
		private cls: ClsService,
		private activityLogService: ActivityLogService,
		private notificationService: NotificationService
	) { }

	async create(dto: CreateTaskListDto): Promise<TaskListEntity> {
		if (!dto.folderId && !dto.spaceId) {
			throw new BadRequestException('folderId və ya spaceId lazımdır')
		}

		const user = this.cls.get('user')
		const list = new TaskListEntity()
		list.name = dto.name
		list.folderId = dto.folderId || null
		list.spaceId = dto.spaceId || null

		// Assignee-ləri əlavə et
		if (dto.assigneeIds?.length) {
			list.assignees = dto.assigneeIds.map(id => ({ id } as UserEntity))
		}

		const savedList = await this.taskListRepo.save(list)

		// Assignee-lərə notification göndər
		if (dto.assigneeIds?.length) {
			for (const userId of dto.assigneeIds) {
				if (userId !== user?.id) {
					await this.notificationService.createNotification({
						userId,
						type: NotificationType.LIST_ASSIGNED,
						title: 'Siyahıya əlavə edildiniz',
						message: `"${savedList.name}" siyahısına əlavə edildiniz`,
						listId: savedList.id
					})
				}
			}
		}

		await this.activityLogService.log(
			ActivityType.LIST_CREATE,
			savedList.id,
			savedList.name,
			`"${savedList.name}" siyahısı yaradıldı`,
			dto.assigneeIds?.length ? { assignees: dto.assigneeIds } : undefined
		)

		return savedList
	}

	async listBySpace(spaceId: number) {
		return await this.taskListRepo.find({
			where: { spaceId, folderId: IsNull() },
			order: { order: 'ASC' },
			relations: ['tasks']
		})
	}

	async getOne(id: number) {
		const taskList = await this.taskListRepo.findOne({
			where: { id },
			relations: ['folder', 'folder.space', 'space']
		})

		if (!taskList) throw new NotFoundException('Siyahı tapılmadı')

		return taskList
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
			.orderBy('taskList.order', 'ASC')
			.addOrderBy('task.order', 'ASC')
			.getMany()
	}

	async updateTaskList(id: number, dto: UpdateTaskListDto) {
		const taskList = await this.taskListRepo.findOne({
			where: { id },
			relations: ['folder', 'space', 'assignees']
		})

		if (!taskList) throw new NotFoundException('Siyahı tapılmadı')

		const user = this.cls.get('user')
		const ownerId = taskList.folder?.ownerId || taskList.space?.ownerId
		if (user.role !== 'admin' && ownerId !== user.id) {
			throw new UnauthorizedException('Siyahını yeniləmək üçün icazəniz yoxdur')
		}

		const oldName = taskList.name
		const changes: Record<string, any> = {}

		// Assignee dəyişikliklərini izlə
		if (dto.assigneeIds !== undefined) {
			const oldAssigneeIds = taskList.assignees?.map(u => u.id) || []
			const newAssigneeIds = dto.assigneeIds || []

			const addedUserIds = newAssigneeIds.filter(id => !oldAssigneeIds.includes(id))
			const removedUserIds = oldAssigneeIds.filter(id => !newAssigneeIds.includes(id))

			// Yeni əlavə edilənlərə notification
			for (const assigneeId of addedUserIds) {
				await this.notificationService.createNotification({
					userId: assigneeId,
					type: NotificationType.LIST_ASSIGNED,
					title: 'Siyahıya əlavə edildiniz',
					message: `"${taskList.name}" siyahısına əlavə edildiniz`,
					listId: taskList.id
				})
			}

			// Çıxarılanlara notification
			for (const assigneeId of removedUserIds) {
				await this.notificationService.createNotification({
					userId: assigneeId,
					type: NotificationType.LIST_UNASSIGNED,
					title: 'Siyahıdan çıxarıldınız',
					message: `"${taskList.name}" siyahısından çıxarıldınız`,
					listId: taskList.id
				})
			}

			if (addedUserIds.length || removedUserIds.length) {
				changes.assignees = { added: addedUserIds, removed: removedUserIds }
			}

			taskList.assignees = newAssigneeIds.map(id => ({ id } as UserEntity))
		}

		if (dto.name) changes.name = { old: oldName, new: dto.name }

		Object.assign(taskList, { name: dto.name })
		await this.taskListRepo.save(taskList)

		await this.activityLogService.log(
			ActivityType.LIST_UPDATE,
			id,
			taskList.name,
			`"${oldName}" siyahısı yeniləndi`,
			changes
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

		// Set deletedById before soft delete
		taskList.deletedById = user.id
		await this.taskListRepo.save(taskList)
		await this.taskListRepo.softDelete({ id })

		await this.activityLogService.log(
			ActivityType.LIST_DELETE,
			id,
			taskList.name,
			`"${taskList.name}" siyahısı silindi`
		)

		return { message: "Siyahı uğurla silindi" }
	}

	async reorderTaskLists(listIds: number[]) {
		for (let i = 0; i < listIds.length; i++) {
			await this.taskListRepo.update(listIds[i], { order: i })
		}
		return { message: "Sıralama yeniləndi" }
	}

	async moveTaskList(id: number, targetFolderId: number | null, targetSpaceId: number | null) {
		const taskList = await this.taskListRepo.findOne({ where: { id } })
		if (!taskList) throw new NotFoundException('Siyahı tapılmadı!')

		const oldFolderId = taskList.folderId
		const oldSpaceId = taskList.spaceId

		taskList.folderId = targetFolderId
		taskList.spaceId = targetSpaceId
		await this.taskListRepo.save(taskList)

		await this.activityLogService.log(
			ActivityType.LIST_UPDATE,
			id,
			taskList.name,
			`"${taskList.name}" siyahısı köçürüldü`,
			{ oldFolderId, oldSpaceId, newFolderId: targetFolderId, newSpaceId: targetSpaceId }
		)

		return { message: "Siyahı köçürüldü" }
	}
}
