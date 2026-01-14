import { Body, Controller, Delete, Get, Param, Post, Query } from "@nestjs/common";
import { SpaceService } from "./space.service";
import { CreateSpaceDto } from "./dto/create-space.dto";
import { UpdateSpaceDto } from "./dto/update-space.dto";
import { ApiTags } from "@nestjs/swagger";
import { Auth } from "../../shared/decorators/auth.decorator";
import { ClsService } from "nestjs-cls";

@ApiTags('space')
@Controller('space')
export class SpaceController {
	constructor(
		private spaceService: SpaceService,
		private cls: ClsService
	) { }

	@Get()
	async listAll() {
		return await this.spaceService.listAll()
	}

	@Get('me')
	@Auth()
	async mySpaces() {
		const user = this.cls.get('user')
		return await this.spaceService.listByOwner(user.id)
	}

	@Get(':id')
	async getOne(@Param('id') id: number) {
		return await this.spaceService.getOne(Number(id))
	}

	@Get(':id/full')
	async getFullDetails(@Param('id') id: number, @Query('search') search?: string) {
		return await this.spaceService.getFullDetails(Number(id), search)
	}

	@Post()
	@Auth()
	async create(@Body() body: CreateSpaceDto) {
		const user = this.cls.get('user')
		return await this.spaceService.create(user.id, body)
	}

	@Post('reorder')
	@Auth()
	async reorderSpaces(@Body() body: { spaceIds: number[] }) {
		return await this.spaceService.reorderSpaces(body.spaceIds)
	}

	@Post(':id')
	@Auth()
	async updateSpace(@Param("id") id: number, @Body() body: UpdateSpaceDto) {
		const user = this.cls.get('user')
		return await this.spaceService.updateSpace(Number(id), user.id, body)
	}

	@Delete(':id')
	@Auth()
	async deleteSpace(@Param("id") id: number) {
		const user = this.cls.get('user')
		return await this.spaceService.deleteSpace(Number(id), user.id)
	}
}
