import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { TaskStatusService } from "./task-status.service";
import { CreateTaskStatusDto } from "./dto/create-task-status.dto";
import { UpdateTaskStatusDto } from "./dto/update-task-status.dto";
import { Auth } from "../../shared/decorators/auth.decorator";
import { Role } from "../../shared/decorators/role.decorator";
import { RoleGuard } from "../../guard/role.guard";

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
	@Role('admin')
	@UseGuards(RoleGuard)
	async create(@Body() body: CreateTaskStatusDto) {
		return await this.taskStatusService.create(body)
	}

	@Post(':id')
	@Auth()
	@Role('admin')
	@UseGuards(RoleGuard)
	async update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateTaskStatusDto) {
		return await this.taskStatusService.update(id, body)
	}

	@Delete(':id')
	@Auth()
	@Role('admin')
	@UseGuards(RoleGuard)
	async delete(@Param('id', ParseIntPipe) id: number) {
		return await this.taskStatusService.delete(id)
	}
}
