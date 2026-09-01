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
import { AssigneeDefaultsService } from "../../shared/services/assignee-defaults.service";
import { resolveFilterDateRange } from "../../shared/utils/filter-date.utils";

@Injectable()
export class TaskListService {
	constructor(
		@InjectRepository(TaskListEntity)
		private taskListRepo: Repository<TaskListEntity>,
		private assigneeDefaults: AssigneeDefaultsService,
		private cls: ClsService,
		private activityLogService: ActivityLogService,
		private notificationService: NotificationService
	) { }

	async create(dto: CreateTaskListDto): Promise<TaskListEntity> {
		if (!dto.folderId && !dto.spaceId) {
			throw new BadRequestException('folderId və ya spaceId lazımdır')
		}

		const user = this.cls.get('user')
		const assigneeIds = await this.assigneeDefaults.mergeResourceAssignees(dto.assigneeIds, user?.id)
		const list = new TaskListEntity()
		list.name = dto.name
		list.type = dto.type || 'list'
		list.createdById = user?.id || null
		list.content = dto.content || null
		list.folderId = dto.folderId || null
		list.spaceId = dto.spaceId || null
		list.order = await this.nextOrder(dto.folderId || null, dto.spaceId || null)
		list.assignees = assigneeIds.map((id) => ({ id } as UserEntity))

		const savedList = await this.taskListRepo.save(list)

		for (const userId of assigneeIds) {
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

		await this.activityLogService.log(
			ActivityType.LIST_CREATE,
			savedList.id,
			savedList.name,
			`"${savedList.name}" siyahısı yaradıldı`,
			assigneeIds.length ? { assignees: assigneeIds } : undefined
		)

		return savedList
	}

	private async nextOrder(folderId: number | null, spaceId: number | null): Promise<number> {
		const qb = this.taskListRepo.createQueryBuilder('list').select('MAX(list.order)', 'max')
		if (folderId) {
			qb.where('list.folderId = :folderId', { folderId })
		} else {
			qb.where('list.spaceId = :spaceId', { spaceId }).andWhere('list.folderId IS NULL')
		}
		const raw = await qb.getRawOne()
		const max = raw?.max == null ? -1 : Number(raw.max)
		return max + 1
	}

	async listBySpace(spaceId: number) {
		return await this.taskListRepo.find({
			where: { spaceId, folderId: IsNull() },
			order: { order: 'ASC', createdAt: 'ASC' },
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
				'(taskList.name LIKE :search OR task.title LIKE :search OR task.description LIKE :search)',
				{ search: `%${filters.search}%` }
			)
		}

		const { start: rangeStart, end: rangeEnd } = resolveFilterDateRange(
			filters?.startDate,
			filters?.endDate,
		)

		if (rangeStart) {
			queryBuilder.andWhere('task.startAt >= :filterStartAt', { filterStartAt: rangeStart })
		}

		if (rangeEnd) {
			queryBuilder.andWhere('task.dueAt <= :filterDueAt', { filterDueAt: rangeEnd })
		}

		return await queryBuilder
			.orderBy('taskList.order', 'ASC')
			.addOrderBy('taskList.createdAt', 'ASC')
			.addOrderBy('task.order', 'ASC')
			.getMany()
	}

	async updateTaskList(id: number, dto: UpdateTaskListDto) {
		const taskList = await this.taskListRepo.findOne({
			where: { id },
			relations: ['folder', 'space', 'assignees']
		})

		if (!taskList) throw new NotFoundException('Siyahı tapılmadı')

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

		if (dto.name !== undefined) taskList.name = dto.name
		if (dto.content !== undefined) taskList.content = dto.content
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
		const ids = (listIds || []).map((id) => Number(id)).filter((id) => Number.isFinite(id))
		if (ids.length === 0) return { message: "Sıralama yeniləndi" }

		const first = await this.taskListRepo.findOne({ where: { id: ids[0] } })
		if (!first) throw new NotFoundException('Siyahı tapılmadı')

		const siblings = await this.taskListRepo.find({
			where: first.folderId
				? { folderId: first.folderId }
				: { spaceId: first.spaceId, folderId: IsNull() },
			order: { order: 'ASC', createdAt: 'ASC' },
		})

		const idSet = new Set(ids)
		const ordered = [
			...ids.map((id) => siblings.find((s) => s.id === id)).filter(Boolean),
			...siblings.filter((s) => !idSet.has(s.id)),
		]

		for (let i = 0; i < ordered.length; i++) {
			await this.taskListRepo.update(ordered[i].id, { order: i })
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
		taskList.order = await this.nextOrder(targetFolderId, targetSpaceId)
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
