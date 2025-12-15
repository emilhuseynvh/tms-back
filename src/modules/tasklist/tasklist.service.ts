import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TaskListEntity } from "../../entities/tasklist.entity";
import { CreateTaskListDto } from "./dto/create-tasklist.dto";
import { UpdateTaskListDto } from "./dto/update-tasklist.dto";
import { FilterTaskListDto } from "./dto/filter-tasklist.dto";
import { ClsService } from "nestjs-cls";

@Injectable()
export class TaskListService {
	constructor(
		@InjectRepository(TaskListEntity)
		private taskListRepo: Repository<TaskListEntity>,
		private cls: ClsService
	) { }

	async create(dto: CreateTaskListDto) {
		const list = this.taskListRepo.create(dto)
		return await this.taskListRepo.save(list)
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
			relations: ['folder']
		})

		if (!taskList) throw new NotFoundException('Siyahı tapılmadı')

		const user = this.cls.get('user')
		if (user.role !== 'admin' && taskList.folder.ownerId !== user.id) {
			throw new UnauthorizedException('Siyahını yeniləmək üçün icazəniz yoxdur')
		}

		Object.assign(taskList, dto)
		await this.taskListRepo.save(taskList)

		return { message: "Siyahı uğurla yeniləndi" }
	}

	async deleteTaskList(id: number) {
		const taskList = await this.taskListRepo.findOne({
			where: { id },
			relations: ['folder']
		})

		if (!taskList) throw new NotFoundException('Siyahı tapılmadı')

		const user = this.cls.get('user')
		if (user.role !== 'admin' && taskList.folder.ownerId !== user.id) {
			throw new UnauthorizedException('Siyahını silmək üçün icazəniz yoxdur')
		}

		await this.taskListRepo.delete({ id })

		return { message: "Siyahı uğurla silindi" }
	}
}
