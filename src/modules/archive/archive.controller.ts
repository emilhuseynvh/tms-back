import { Controller, Get, Param, ParseIntPipe, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ArchiveService } from "./archive.service";
import { Auth } from "../../shared/decorators/auth.decorator";

@ApiTags('archive')
@Controller('archive')
export class ArchiveController {
	constructor(private archiveService: ArchiveService) { }

	@Get()
	@Auth()
	async getArchive() {
		return await this.archiveService.getArchive()
	}

	@Post('space/:id')
	@Auth()
	async archiveSpace(@Param('id', ParseIntPipe) id: number) {
		return await this.archiveService.archiveSpace(id)
	}

	@Post('unarchive/space/:id')
	@Auth()
	async unarchiveSpace(@Param('id', ParseIntPipe) id: number) {
		return await this.archiveService.unarchiveSpace(id)
	}

	@Post('folder/:id')
	@Auth()
	async archiveFolder(@Param('id', ParseIntPipe) id: number) {
		return await this.archiveService.archiveFolder(id)
	}

	@Post('unarchive/folder/:id')
	@Auth()
	async unarchiveFolder(@Param('id', ParseIntPipe) id: number) {
		return await this.archiveService.unarchiveFolder(id)
	}

	@Post('list/:id')
	@Auth()
	async archiveList(@Param('id', ParseIntPipe) id: number) {
		return await this.archiveService.archiveList(id)
	}

	@Post('unarchive/list/:id')
	@Auth()
	async unarchiveList(@Param('id', ParseIntPipe) id: number) {
		return await this.archiveService.unarchiveList(id)
	}

	@Post('task/:id')
	@Auth()
	async archiveTask(@Param('id', ParseIntPipe) id: number) {
		return await this.archiveService.archiveTask(id)
	}

	@Post('unarchive/task/:id')
	@Auth()
	async unarchiveTask(@Param('id', ParseIntPipe) id: number) {
		return await this.archiveService.unarchiveTask(id)
	}
}
