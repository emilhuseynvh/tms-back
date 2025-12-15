import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from "@nestjs/common";
import { TaskStatusService } from "./task-status.service";
import { CreateTaskStatusDto } from "./dto/create-task-status.dto";
import { UpdateTaskStatusDto } from "./dto/update-task-status.dto";
import { Auth } from "../../shared/decorators/auth.decorator";

@Controller('task-status')
export class TaskStatusController {
	constructor(private taskStatusService: TaskStatusService) { }

	@Get()
	async list() {
		return await this.taskStatusService.list()
	}

	@Get(':id')
	async getById(@Param('id', ParseIntPipe) id: number) {
		return await this.taskStatusService.getById(id)
	}

	@Post()
	@Auth()
	async create(@Body() body: CreateTaskStatusDto) {
		return await this.taskStatusService.create(body)
	}

	@Post(':id')
	@Auth()
	async update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateTaskStatusDto) {
		return await this.taskStatusService.update(id, body)
	}

	@Delete(':id')
	@Auth()
	async delete(@Param('id', ParseIntPipe) id: number) {
		return await this.taskStatusService.delete(id)
	}
}
