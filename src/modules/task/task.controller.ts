import { Body, Controller, Get, Param, Post, Put, ParseIntPipe, Delete, Query } from "@nestjs/common";
import { TaskService } from "./task.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { Auth } from "../../shared/decorators/auth.decorator";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { ReorderTaskDto } from "./dto/reorder-task.dto";
import { FilterTaskDto } from "./dto/filter-task.dto";

@Controller('task')
export class TaskController {
	constructor(private taskService: TaskService) { }

	@Get('my-tasks')
	@Auth()
	async getMyTasks() {
		return await this.taskService.getMyTasks()
	}

	@Get('list/:taskListId')
	async listByTaskList(
		@Param('taskListId') taskListId: number,
		@Query() filters: FilterTaskDto
	) {
		return await this.taskService.listByTaskList(Number(taskListId), filters)
	}

	@Post()
	@Auth()
	async create(@Body() body: CreateTaskDto) {
		return await this.taskService.create(body)
	}

	@Post('reorder')
	@Auth()
	async reorder(@Body() body: ReorderTaskDto) {
		return await this.taskService.reorder(body)
	}

	@Post(':id')
	@Auth()
	async update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateTaskDto) {
		return await this.taskService.update(id, body)
	}
	@Delete(':id')
	@Auth()
	async deleteTask(@Param("id") id: number) {
		return await this.taskService.deleteTask(id)
	}

	@Get(':id/activities')
	@Auth()
	async getTaskActivities(
		@Param('id', ParseIntPipe) id: number,
		@Query('limit') limit?: number
	) {
		return await this.taskService.getTaskActivities(id, limit ? Number(limit) : 10)
	}
}

