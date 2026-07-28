import { BadRequestException, Injectable, NotFoundException, UnauthorizedException, Inject, forwardRef } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, MoreThan, Between } from "typeorm";
import { TaskEntity } from "../../entities/task.entity";
import { TaskListEntity } from "../../entities/tasklist.entity";
import { TaskStatusEntity } from "../../entities/task-status.entity";
import { UserEntity } from "../../entities/user.entity";
import { TaskActivityEntity } from "../../entities/task-activity.entity";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { ReorderTaskDto } from "./dto/reorder-task.dto";
import { FilterTaskDto } from "./dto/filter-task.dto";
import { ClsService } from "nestjs-cls";
import { AssigneeDefaultsService } from "../../shared/services/assignee-defaults.service";
import { ActivityLogService } from "../activity-log/activity-log.service";
import { ActivityType } from "../../entities/activity-log.entity";
import { NotificationService } from "../notification/notification.service";
import { NotificationGateway } from "../notification/notification.gateway";
import { resolveFilterDateRange } from "../../shared/utils/filter-date.utils";

@Injectable()
export class TaskService {
	constructor(
		@InjectRepository(TaskEntity)
		private taskRepo: Repository<TaskEntity>,
		@InjectRepository(TaskListEntity)
		private taskListRepo: Repository<TaskListEntity>,
		@InjectRepository(TaskStatusEntity)
		private taskStatusRepo: Repository<TaskStatusEntity>,
		@InjectRepository(TaskActivityEntity)
		private taskActivityRepo: Repository<TaskActivityEntity>,
		private assigneeDefaults: AssigneeDefaultsService,
		private cls: ClsService,
		private activityLogService: ActivityLogService,
		@Inject(forwardRef(() => NotificationService))
		private notificationService: NotificationService,
		@Inject(forwardRef(() => NotificationGateway))
		private notificationGateway: NotificationGateway
	) { }

	async create(dto: CreateTaskDto) {
		if (dto.statusId !== undefined && dto.statusId !== null) {
			await this.ensureStatusExists(dto.statusId)
		}
		const creator = this.cls.get('user')
		const assigneeIds = this.assigneeDefaults.resolveTaskAssigneeIds(dto.assigneeIds, creator?.id)
		const count = await this.taskRepo.count({ where: { taskListId: dto.taskListId } })
		const task = this.taskRepo.create({
			title: dto.title,
			description: dto.description ?? '',
			taskListId: dto.taskListId,
			statusId: dto.statusId || null,
			startAt: dto.startAt ? new Date(dto.startAt) : new Date(),
			dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
			parentId: dto.parentId || null,
			order: count,
			link: dto.link ?? null,
			assignees: assigneeIds.map((id) => ({ id } as UserEntity))
		} as Partial<TaskEntity>)
		const savedTask = await this.taskRepo.save(task)

		// Assign edilmiş userlər üçün notification record yarat və bildiriş göndər
		if (assigneeIds.length > 0) {
			for (const userId of assigneeIds) {
				await this.notificationService.createNotificationRecord(savedTask.id, userId)
				const notification = await this.notificationService.notifyTaskAssigned(savedTask.id, userId, savedTask.title)
				this.notificationGateway.emitNewNotification(userId, notification)
				const unreadCount = await this.notificationService.getUnreadCount(userId)
				this.notificationGateway.emitUnreadCountUpdate(userId, unreadCount)
			}
		}

		await this.activityLogService.log(
			ActivityType.TASK_CREATE,
			savedTask.id,
			savedTask.title,
			`"${savedTask.title}" tapşırığı yaradıldı`
		)

		// Task yaratma logu - task-ın öz log hissəsinə düşsün
		await this.logTaskCreation(savedTask.id, savedTask.title)

		return savedTask
	}

	async listByTaskList(taskListId: number, filters?: FilterTaskDto) {
		const user = this.cls.get('user')
		const isAdmin = user?.role === 'admin'

		const queryBuilder = this.taskRepo.createQueryBuilder('task')
			.leftJoinAndSelect('task.status', 'status')
			.leftJoinAndSelect('task.assignees', 'assignees')
			.where('task.taskListId = :taskListId', { taskListId })
			.andWhere('task.parentId IS NULL')
			.andWhere('(task.isArchived IS NULL OR task.isArchived = false)')

		// User yalnız özünə assign edilmiş task-ları görür
		if (!isAdmin && user?.id) {
			queryBuilder.andWhere(qb => {
				const subQuery = qb.subQuery()
					.select('1')
					.from('task_assignees', 'ta')
					.where('ta.taskId = task.id')
					.andWhere('ta.userId = :userId')
					.getQuery()
				return `EXISTS ${subQuery}`
			})
			queryBuilder.setParameter('userId', user.id)
		}

		if (filters?.search) {
			queryBuilder.andWhere(
				'(task.title LIKE :search OR task.description LIKE :search)',
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

		if (filters?.statusId) {
			queryBuilder.andWhere('task.statusId = :statusId', { statusId: parseInt(filters.statusId) })
		}

		if (filters?.assigneeId) {
			queryBuilder.andWhere(qb => {
				const subQuery = qb.subQuery()
					.select('1')
					.from('task_assignees', 'ta_filter')
					.where('ta_filter.taskId = task.id')
					.andWhere('ta_filter.userId = :filterAssigneeId')
					.getQuery()
				return `EXISTS ${subQuery}`
			})
			queryBuilder.setParameter('filterAssigneeId', parseInt(filters.assigneeId))
		}

		const tasks = await queryBuilder
			.orderBy('task.order', 'ASC')
			.addOrderBy('task.createdAt', 'DESC')
			.getMany()

		return await this.loadChildren(tasks, isAdmin, user?.id, filters)
	}

	private async loadChildren(tasks: TaskEntity[], isAdmin: boolean = true, userId?: number, filters?: FilterTaskDto): Promise<TaskEntity[]> {
		for (const task of tasks) {
			let childQuery = this.taskRepo.createQueryBuilder('task')
				.leftJoinAndSelect('task.assignees', 'assignees')
				.leftJoinAndSelect('task.status', 'status')
				.where('task.parentId = :parentId', { parentId: task.id })
				.andWhere('(task.isArchived IS NULL OR task.isArchived = false)')

			// User yalnız özünə assign edilmiş child task-ları görür
			if (!isAdmin && userId) {
				childQuery.andWhere(qb => {
					const subQuery = qb.subQuery()
						.select('1')
						.from('task_assignees', 'ta')
						.where('ta.taskId = task.id')
						.andWhere('ta.userId = :userId', { userId })
						.getQuery()
					return `EXISTS ${subQuery}`
				})
			}

			// Apply filters to children
			if (filters?.statusId) {
				childQuery.andWhere('task.statusId = :childStatusId', { childStatusId: parseInt(filters.statusId) })
			}

			if (filters?.assigneeId) {
				childQuery.andWhere(qb => {
					const subQuery = qb.subQuery()
						.select('1')
						.from('task_assignees', 'ta_child_filter')
						.where('ta_child_filter.taskId = task.id')
						.andWhere('ta_child_filter.userId = :childFilterAssigneeId')
						.getQuery()
					return `EXISTS ${subQuery}`
				})
				childQuery.setParameter('childFilterAssigneeId', parseInt(filters.assigneeId))
			}

			const children = await childQuery
				.orderBy('task.order', 'ASC')
				.addOrderBy('task.createdAt', 'DESC')
				.getMany()

			if (children.length > 0) {
				task.children = await this.loadChildren(children, isAdmin, userId, filters)
			}
		}
		return tasks
	}

	async update(id: number, dto: UpdateTaskDto) {
		const task = await this.taskRepo.findOne({ where: { id }, relations: ['assignees'] })
		if (!task) throw new NotFoundException('Task not found')

		if (dto.statusId !== undefined && dto.statusId !== null) {
			await this.ensureStatusExists(dto.statusId)
		}

		const changes: Record<string, { from: unknown, to: unknown, fromId?: unknown, toId?: unknown }> = {}
		this.collectChanges(changes, 'title', task.title, dto.title)
		this.collectChanges(changes, 'description', task.description, dto.description)
		this.collectChanges(changes, 'startAt', task.startAt, dto.startAt ? new Date(dto.startAt) : dto.startAt === null ? null : undefined)
		this.collectChanges(changes, 'dueAt', task.dueAt, dto.dueAt ? new Date(dto.dueAt) : dto.dueAt === null ? null : undefined)
		this.collectChanges(changes, 'statusId', task.statusId, dto.statusId)
		this.collectChanges(changes, 'taskListId', task.taskListId, dto.taskListId)
		this.collectChanges(changes, 'link', task.link, dto.link)
		this.collectChanges(changes, 'doc', task.doc, dto.doc)
		this.collectChanges(changes, 'meetingNotes', task.meetingNotes, dto.meetingNotes)

		if (dto.assigneeIds !== undefined) {
			const prev = (task.assignees || []).map((a) => a.id).sort()
			const next = [...dto.assigneeIds].sort()
			if (prev.length !== next.length || prev.some((v, idx) => v !== next[idx])) {
				changes.assignees = { from: prev, to: next }
			}
		}

		if (dto.startAt !== undefined) task.startAt = dto.startAt ? new Date(dto.startAt) : null
		if (dto.dueAt !== undefined) task.dueAt = dto.dueAt ? new Date(dto.dueAt) : null
		if (dto.title !== undefined) task.title = dto.title
		if (dto.description !== undefined) task.description = dto.description
		if (dto.assigneeIds !== undefined) {
			const prevIds = (task.assignees || []).map((a) => a.id)
			const nextIds = dto.assigneeIds

			const addedUserIds = nextIds.filter(id => !prevIds.includes(id))
			for (const userId of addedUserIds) {
				await this.notificationService.createNotificationRecord(id, userId)
				const notification = await this.notificationService.notifyTaskAssigned(id, userId, task.title)
				this.notificationGateway.emitNewNotification(userId, notification)
				const unreadCount = await this.notificationService.getUnreadCount(userId)
				this.notificationGateway.emitUnreadCountUpdate(userId, unreadCount)
			}

			const removedUserIds = prevIds.filter(id => !nextIds.includes(id))
			for (const userId of removedUserIds) {
				await this.notificationService.removeNotificationRecord(id, userId)
				const notification = await this.notificationService.notifyTaskUnassigned(id, userId, task.title)
				this.notificationGateway.emitNewNotification(userId, notification)
				const unreadCount = await this.notificationService.getUnreadCount(userId)
				this.notificationGateway.emitUnreadCountUpdate(userId, unreadCount)
			}

			task.assignees = dto.assigneeIds.map((id) => ({ id } as UserEntity))
			task.updatedAt = new Date()
		}
		if (dto.statusId !== undefined) {
			task.statusId = dto.statusId
			// eager: true olduğu üçün status relation-ı statusId-ni override edə bilər, onu silirik
			delete (task as any).status
		}
		if (dto.link !== undefined) task.link = dto.link
		if (dto.doc !== undefined) task.doc = dto.doc
		if (dto.meetingNotes !== undefined) task.meetingNotes = dto.meetingNotes
		if (dto.parentId !== undefined) {
			const oldParentName = task.parentId ? (await this.taskRepo.findOne({ where: { id: task.parentId } }))?.title : null
			const newParentName = dto.parentId ? (await this.taskRepo.findOne({ where: { id: dto.parentId } }))?.title : null
			if (task.parentId !== dto.parentId) {
				changes['parentId'] = {
					from: oldParentName,
					to: newParentName,
					fromId: task.parentId,
					toId: dto.parentId
				}
			}
			task.parentId = dto.parentId ?? null
		}
		if (dto.taskListId !== undefined && dto.taskListId !== task.taskListId) {
			await this.moveTaskToListSafely(task, dto.taskListId, {
				detachFromParent: dto.parentId === null,
			})
			task.taskListId = dto.taskListId
			await this.logTaskActivity(task.id, changes)

			await this.activityLogService.log(
				ActivityType.TASK_UPDATE,
				id,
				task.title,
				`"${task.title}" tapşırığı yeniləndi`,
				{ ...changes }
			)

			return await this.taskRepo.findOne({
				where: { id },
				relations: ['assignees', 'status']
			})
		}
		await this.taskRepo.save(task)

		const updatedTask = await this.taskRepo.findOne({
			where: { id },
			relations: ['assignees', 'status']
		})

		await this.logTaskActivity(task.id, changes)

		if (Object.keys(changes).length > 0) {
			await this.activityLogService.log(
				ActivityType.TASK_UPDATE,
				id,
				task.title,
				`"${task.title}" tapşırığı yeniləndi`,
				{ ...changes }
			)
		}

		return updatedTask
	}

	private async ensureStatusExists(statusId: number) {
		const exists = await this.taskStatusRepo.exist({ where: { id: statusId } })
		if (!exists) throw new NotFoundException('Task status not found')
	}

	private collectChanges(
		acc: Record<string, { from: unknown, to: unknown }>,
		key: string,
		fromValue: unknown,
		toValue: unknown
	) {
		if (toValue === undefined) return
		const normalizedFrom = fromValue instanceof Date ? fromValue.toISOString() : fromValue
		const normalizedTo = toValue instanceof Date ? toValue.toISOString() : toValue
		if (normalizedFrom !== normalizedTo) {
			acc[key] = { from: normalizedFrom ?? null, to: normalizedTo ?? null }
		}
	}

	private async logTaskActivity(taskId: number, changes: Record<string, { from: unknown, to: unknown }>) {
		if (!changes || Object.keys(changes).length === 0) return
		const user = this.cls.get('user') || {}
		const log = this.taskActivityRepo.create({
			taskId,
			userId: user.id ?? null,
			username: user.username ?? null,
			changes
		})
		await this.taskActivityRepo.save(log)
	}

	private async ensureActiveTaskList(taskListId: number): Promise<TaskListEntity> {
		const list = await this.taskListRepo.findOne({
			where: { id: taskListId, isArchived: false },
		})
		if (!list) {
			throw new NotFoundException('Hədəf siyahı tapılmadı və ya arxivlənib')
		}
		return list
	}

	/**
	 * Köçürür: yalnız taskListId, order və lazım olanda parentId yenilənir.
	 * Heç bir sətir silinmir; bütün addımlar tranzaksiyada icra olunur.
	 */
	private async moveTaskToListSafely(
		task: TaskEntity,
		targetListId: number,
		options: { detachFromParent?: boolean } = {},
	): Promise<void> {
		if (task.taskListId === targetListId) return

		await this.ensureActiveTaskList(targetListId)

		await this.taskRepo.manager.transaction(async (manager) => {
			const taskRepo = manager.getRepository(TaskEntity)

			// increment/decrement hər iki DB-də (mysql/postgres) düzgün identifikator dırnaqlaması yaradır
			await taskRepo.decrement(
				{ taskListId: task.taskListId, order: MoreThan(task.order) },
				'order',
				1,
			)

			const newIndex = await taskRepo.count({ where: { taskListId: targetListId } })

			const updateFields: { taskListId: number; order: number; parentId?: number | null } = {
				taskListId: targetListId,
				order: newIndex,
			}

			if (options.detachFromParent) {
				if (task.parentId !== null) {
					updateFields.parentId = null
				}
			} else if (task.parentId) {
				const parent = await taskRepo.findOne({ where: { id: task.parentId } })
				if (parent && parent.taskListId !== targetListId) {
					throw new BadRequestException(
						'Ana tapşırıq başqa siyahıdadır. Əvvəlcə ana tapşırığı köçürün və ya alt tapşırığı ayrı köçürmək üçün parentId: null göndərin.',
					)
				}
			}

			await taskRepo.update({ id: task.id }, updateFields)
			await this.syncDescendantsTaskListIdInRepo(taskRepo, task.id, targetListId)
		})
	}

	/** Yalnız alt tapşırıqların taskListId sahəsini yeniləyir (parentId və digər məlumatlar toxunulmur). */
	private async syncDescendantsTaskListIdInRepo(
		taskRepo: Repository<TaskEntity>,
		parentId: number,
		taskListId: number,
	): Promise<void> {
		const children = await taskRepo.find({ where: { parentId } })
		for (const child of children) {
			if (child.taskListId !== taskListId) {
				await taskRepo.update({ id: child.id }, { taskListId })
			}
			await this.syncDescendantsTaskListIdInRepo(taskRepo, child.id, taskListId)
		}
	}

	private async logTaskCreation(taskId: number, taskTitle?: string) {
		const user = this.cls.get('user') || {}
		const log = this.taskActivityRepo.create({
			taskId,
			userId: user.id ?? null,
			username: user.username ?? null,
			changes: { created: { from: null, to: taskTitle ? `"${taskTitle}" tapşırığı yaradıldı` : 'Tapşırıq yaradıldı' } }
		})
		await this.taskActivityRepo.save(log)
	}

	async reorder(params: ReorderTaskDto) {
		const task = await this.taskRepo.findOne({ where: { id: params.taskId } })
		if (!task) throw new NotFoundException('Task not found')

		const currentListId = task.taskListId
		const currentOrder = task.order

		const total = await this.taskRepo.count({ where: { taskListId: currentListId } })
		let targetIndex = Number.isFinite(params.targetIndex as unknown as number) ? Number(params.targetIndex) : currentOrder
		targetIndex = Math.max(0, Math.min(total - 1, Math.floor(targetIndex)))

		if (targetIndex === currentOrder) return task

		if (targetIndex < currentOrder) {
			// order >= targetIndex AND order < currentOrder
			await this.taskRepo.increment(
				{ taskListId: currentListId, order: Between(targetIndex, currentOrder - 1) },
				'order',
				1,
			)
		} else {
			// order > currentOrder AND order <= targetIndex
			await this.taskRepo.decrement(
				{ taskListId: currentListId, order: Between(currentOrder + 1, targetIndex) },
				'order',
				1,
			)
		}
		task.order = targetIndex
		return await this.taskRepo.save(task)
	}

	async deleteTask(id: number) {
		const task = await this.taskRepo.findOne({
			where: { id },
			relations: ['taskList', 'taskList.folder']
		})

		if (!task) throw new NotFoundException('Tapşırıq tapılmadı!')

		const user = this.cls.get('user')
		if (user?.role !== 'admin' && task.taskList?.folder?.ownerId !== user?.id) {
			throw new UnauthorizedException('Tapşırığı silmək üçün icazəniz yoxdur!')
		}

		// Set deletedById before soft delete
		task.deletedById = user.id
		await this.taskRepo.save(task)
		await this.taskRepo.softDelete({ id })

		await this.activityLogService.log(
			ActivityType.TASK_DELETE,
			id,
			task.title,
			`"${task.title}" tapşırığı silindi`
		)

		return { message: "Tapşırıq uğurla silindi!" }
	}

	async getTaskActivities(taskId: number, limit: number = 10) {
		return await this.taskActivityRepo.find({
			where: { taskId },
			order: { createdAt: 'DESC' },
			take: limit
		})
	}

	async getMyTasks() {
		const user = this.cls.get('user')
		if (!user?.id) return []

		const isAdmin = user.role === 'admin'

		const queryBuilder = this.taskRepo.createQueryBuilder('task')
			.leftJoinAndSelect('task.status', 'status')
			.leftJoinAndSelect('task.assignees', 'assignees')
			.where('task.isArchived = false')
			.andWhere('task.deletedAt IS NULL')
			.andWhere('task.dueAt IS NOT NULL')

		if (!isAdmin) {
			queryBuilder.andWhere(qb => {
				const subQuery = qb.subQuery()
					.select('1')
					.from('task_assignees', 'ta')
					.where('ta.taskId = task.id')
					.andWhere('ta.userId = :userId')
					.getQuery()
				return `EXISTS ${subQuery}`
			})
			queryBuilder.setParameter('userId', user.id)
		}

		return await queryBuilder
			.orderBy('task.dueAt', 'ASC')
			.getMany()
	}
}
