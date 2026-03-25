import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TaskStatusEntity } from "../../entities/task-status.entity";
import { CreateTaskStatusDto } from "./dto/create-task-status.dto";
import { UpdateTaskStatusDto } from "./dto/update-task-status.dto";

@Injectable()
export class TaskStatusService {
	constructor(
		@InjectRepository(TaskStatusEntity)
		private taskStatusRepo: Repository<TaskStatusEntity>
	) { }

	async list() {
		return await this.taskStatusRepo.find({ order: { order: 'ASC', createdAt: 'DESC' } })
	}

	async getById(id: number) {
		const status = await this.taskStatusRepo.findOne({ where: { id } })
		if (!status) throw new NotFoundException('Tapşırıq statusu tapılmadı!')
		return status
	}

	async create(dto: CreateTaskStatusDto) {
		const status = this.taskStatusRepo.create(dto)
		return await this.taskStatusRepo.save(status)
	}

	async update(id: number, dto: UpdateTaskStatusDto) {
		const status = await this.getById(id)
		Object.assign(status, dto)
		return await this.taskStatusRepo.save(status)
	}

	async reorder(statusIds: number[]) {
		const updates = statusIds.map((id, index) =>
			this.taskStatusRepo.update(id, { order: index })
		)
		await Promise.all(updates)
		return { message: 'Statuslar yenidən sıralandı!' }
	}

	async delete(id: number) {
		await this.getById(id)
		await this.taskStatusRepo.delete({ id })
		return { message: "Tapşırıq statusu uğurla silindi!" }
	}
}
