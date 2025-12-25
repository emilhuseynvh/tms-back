import { Controller, Get, Param, ParseIntPipe, Post, Delete } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { TrashService } from "./trash.service";
import { Auth } from "../../shared/decorators/auth.decorator";

@ApiTags('trash')
@Controller('trash')
export class TrashController {
	constructor(private trashService: TrashService) { }

	@Get()
	@Auth()
	async getTrash() {
		return await this.trashService.getTrash()
	}

	@Post('restore/space/:id')
	@Auth()
	async restoreSpace(@Param('id', ParseIntPipe) id: number) {
		return await this.trashService.restoreSpace(id)
	}

	@Post('restore/folder/:id')
	@Auth()
	async restoreFolder(@Param('id', ParseIntPipe) id: number) {
		return await this.trashService.restoreFolder(id)
	}

	@Post('restore/list/:id')
	@Auth()
	async restoreList(@Param('id', ParseIntPipe) id: number) {
		return await this.trashService.restoreList(id)
	}

	@Post('restore/task/:id')
	@Auth()
	async restoreTask(@Param('id', ParseIntPipe) id: number) {
		return await this.trashService.restoreTask(id)
	}

	@Delete('space/:id')
	@Auth()
	async permanentDeleteSpace(@Param('id', ParseIntPipe) id: number) {
		return await this.trashService.permanentDeleteSpace(id)
	}

	@Delete('folder/:id')
	@Auth()
	async permanentDeleteFolder(@Param('id', ParseIntPipe) id: number) {
		return await this.trashService.permanentDeleteFolder(id)
	}

	@Delete('list/:id')
	@Auth()
	async permanentDeleteList(@Param('id', ParseIntPipe) id: number) {
		return await this.trashService.permanentDeleteList(id)
	}

	@Delete('task/:id')
	@Auth()
	async permanentDeleteTask(@Param('id', ParseIntPipe) id: number) {
		return await this.trashService.permanentDeleteTask(id)
	}
}
