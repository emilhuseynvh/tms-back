import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TaskEntity } from "../../entities/task.entity";
import { TaskStatusEntity } from "../../entities/task-status.entity";
import { UserEntity } from "../../entities/user.entity";
import { TaskActivityEntity } from "../../entities/task-activity.entity";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { ReorderTaskDto } from "./dto/reorder-task.dto";
import { FilterTaskDto } from "./dto/filter-task.dto";
import { ClsService } from "nestjs-cls";

@Injectable()
export class TaskService {
	constructor(
		@InjectRepository(TaskEntity)
		private taskRepo: Repository<TaskEntity>,
		@InjectRepository(TaskStatusEntity)
		private taskStatusRepo: Repository<TaskStatusEntity>,
		@InjectRepository(TaskActivityEntity)
		private taskActivityRepo: Repository<TaskActivityEntity>,
		private cls: ClsService
	) { }

	async create(dto: CreateTaskDto) {
		if (dto.statusId !== undefined && dto.statusId !== null) {
			await this.ensureStatusExists(dto.statusId)
		}
		const count = await this.taskRepo.count({ where: { taskListId: dto.taskListId } })
		const task = this.taskRepo.create({
			title: dto.title,
			description: dto.description ?? '',
			taskListId: dto.taskListId,
			statusId: dto.statusId ?? '',
			startAt: dto.startAt ? new Date(dto.startAt) : null,
			dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
			parentId: dto.parentId || null,
			order: count,
			assignees: dto.assigneeIds?.map((id) => ({ id } as UserEntity)) || []
		} as Partial<TaskEntity>)
		return await this.taskRepo.save(task)
	}

	async listByTaskList(taskListId: number, filters?: FilterTaskDto) {
		const queryBuilder = this.taskRepo.createQueryBuilder('task')
			.leftJoinAndSelect('task.status', 'status')
			.leftJoinAndSelect('task.assignees', 'assignees')
			.where('task.taskListId = :taskListId', { taskListId })
			.andWhere('task.parentId IS NULL')

		if (filters?.search) {
			queryBuilder.andWhere(
				'(task.title ILIKE :search OR task.description ILIKE :search)',
				{ search: `%${filters.search}%` }
			)
		}

		if (filters?.startDate) {
			queryBuilder.andWhere('task.startAt >= :startDate', { startDate: filters.startDate })
		}

		if (filters?.endDate) {
			queryBuilder.andWhere('task.startAt <= :endDate', { endDate: filters.endDate })
		}

		const tasks = await queryBuilder
			.orderBy('task.order', 'ASC')
			.addOrderBy('task.createdAt', 'DESC')
			.getMany()

		return await this.loadChildren(tasks)
	}

	private async loadChildren(tasks: TaskEntity[]): Promise<TaskEntity[]> {
		for (const task of tasks) {
			const children = await this.taskRepo.find({
				where: { parentId: task.id },
				order: { order: 'ASC', createdAt: 'DESC' },
				relations: ['assignees', 'status']
			})
			if (children.length > 0) {
				task.children = await this.loadChildren(children)
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

		const changes: Record<string, { from: unknown, to: unknown }> = {}
		this.collectChanges(changes, 'title', task.title, dto.title)
		this.collectChanges(changes, 'description', task.description, dto.description)
		this.collectChanges(changes, 'startAt', task.startAt, dto.startAt ? new Date(dto.startAt) : dto.startAt === null ? null : undefined)
		this.collectChanges(changes, 'dueAt', task.dueAt, dto.dueAt ? new Date(dto.dueAt) : dto.dueAt === null ? null : undefined)
		this.collectChanges(changes, 'is_message_send', task.is_message_send, dto.is_message_send)
		this.collectChanges(changes, 'statusId', task.statusId, dto.statusId)
		this.collectChanges(changes, 'taskListId', task.taskListId, dto.taskListId)

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
		if (dto.is_message_send !== undefined) task.is_message_send = dto.is_message_send
		if (dto.description !== undefined) task.description = dto.description
		if (dto.assigneeIds !== undefined) {
			task.assignees = dto.assigneeIds.map((id) => ({ id } as UserEntity))
		}
		if (dto.statusId !== undefined) task.statusId = dto.statusId
		if (dto.taskListId !== undefined && dto.taskListId !== task.taskListId) {
			await this.taskRepo
				.createQueryBuilder()
				.update(TaskEntity)
				.set({ order: () => "\"order\" - 1" })
				.where('"taskListId" = :listId AND "order" > :oldOrder', { listId: task.taskListId, oldOrder: task.order })
				.execute()

			const newIndex = await this.taskRepo.count({ where: { taskListId: dto.taskListId } })
			task.taskListId = dto.taskListId
			task.order = newIndex
			const savedTask = await this.taskRepo.save(task)
			await this.logTaskActivity(task.id, changes)
			return savedTask
		}
		const savedTask = await this.taskRepo.save(task)
		await this.logTaskActivity(task.id, changes)
		return savedTask
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
			await this.taskRepo
				.createQueryBuilder()
				.update(TaskEntity)
				.set({ order: () => "\"order\" + 1" })
				.where('"taskListId" = :listId AND "order" >= :start AND "order" < :end', { listId: currentListId, start: targetIndex, end: currentOrder })
				.execute()
		} else {
			await this.taskRepo
				.createQueryBuilder()
				.update(TaskEntity)
				.set({ order: () => "\"order\" - 1" })
				.where('"taskListId" = :listId AND "order" <= :end AND "order" > :start', { listId: currentListId, start: currentOrder, end: targetIndex })
				.execute()
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
		if (user.role !== 'admin' && task.taskList?.folder?.ownerId !== user.id) {
			throw new UnauthorizedException('Tapşırığı silmək üçün icazəniz yoxdur!')
		}

		await this.taskRepo.delete({ id })

		return { message: "Tapşırıq uğurla silindi!" }
	}
}
