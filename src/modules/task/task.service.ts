import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TaskEntity } from "../../entities/task.entity";
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
		private cls: ClsService
	) { }

	async create(dto: CreateTaskDto) {
		const count = await this.taskRepo.count({ where: { taskListId: dto.taskListId } })
		const task = this.taskRepo.create({
			title: dto.title,
			description: dto.description,
			taskListId: dto.taskListId,
			assigneeId: dto.assigneeId,
			status: dto.status,
			startAt: dto.startAt ? new Date(dto.startAt) : null,
			dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
			parentId: dto.parentId || null,
			order: count
		} as Partial<TaskEntity>)
		return await this.taskRepo.save(task)
	}

	async listByTaskList(taskListId: number, filters?: FilterTaskDto) {
		const queryBuilder = this.taskRepo.createQueryBuilder('task')
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
				order: { order: 'ASC', createdAt: 'DESC' }
			})
			if (children.length > 0) {
				task.children = await this.loadChildren(children)
			}
		}
		return tasks
	}

	async update(id: number, dto: UpdateTaskDto) {
		const task = await this.taskRepo.findOne({ where: { id } })
		if (!task) throw new NotFoundException('Task not found')

		if (dto.startAt !== undefined) task.startAt = dto.startAt ? new Date(dto.startAt) : null
		if (dto.dueAt !== undefined) task.dueAt = dto.dueAt ? new Date(dto.dueAt) : null
		if (dto.title !== undefined) task.title = dto.title
		if (dto.is_message_send !== undefined) task.is_message_send = dto.is_message_send
		if (dto.description !== undefined) task.description = dto.description
		if (dto.assigneeId !== undefined) task.assigneeId = dto.assigneeId
		if (dto.status !== undefined) task.status = dto.status
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
			return await this.taskRepo.save(task)
		}
		return await this.taskRepo.save(task)
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

