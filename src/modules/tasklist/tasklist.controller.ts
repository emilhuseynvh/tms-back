import { Body, Controller, Delete, Get, Param, Post, Query } from "@nestjs/common";
import { TaskListService } from "./tasklist.service";
import { CreateTaskListDto } from "./dto/create-tasklist.dto";
import { UpdateTaskListDto } from "./dto/update-tasklist.dto";
import { FilterTaskListDto } from "./dto/filter-tasklist.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Auth } from "../../shared/decorators/auth.decorator";

@ApiTags('task-list')
@Controller('task-list')
export class TaskListController {
	constructor(private taskListService: TaskListService) { }

	@Get('folder/:folderId')
	async listByFolder(
		@Param('folderId') folderId: number,
		@Query() filters: FilterTaskListDto
	) {
		return await this.taskListService.listByFolder(Number(folderId), filters)
	}

	@Get('space/:spaceId')
	async listBySpace(@Param('spaceId') spaceId: number) {
		return await this.taskListService.listBySpace(Number(spaceId))
	}

	@Get(':id')
	async getOne(@Param('id') id: number) {
		return await this.taskListService.getOne(Number(id))
	}

	@Post()
	@Auth()
	async create(@Body() body: CreateTaskListDto) {
		return await this.taskListService.create(body)
	}

	@Post(':id')
	@Auth()
	async updateTaskList(@Param("id") id: number, @Body() body: UpdateTaskListDto) {
		return await this.taskListService.updateTaskList(Number(id), body)
	}

	@Delete(':id')
	@Auth()
	async deleteTaskList(@Param("id") id: number) {
		return await this.taskListService.deleteTaskList(Number(id))
	}

	@Post('reorder')
	@Auth()
	async reorderTaskLists(@Body() body: { listIds: number[] }) {
		return await this.taskListService.reorderTaskLists(body.listIds)
	}

	@Post(':id/move')
	@Auth()
	async moveTaskList(@Param('id') id: number, @Body() body: { targetFolderId?: number, targetSpaceId?: number }) {
		return await this.taskListService.moveTaskList(Number(id), body.targetFolderId || null, body.targetSpaceId || null)
	}
}

