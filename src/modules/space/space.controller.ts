import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
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
		return await this.spaceService.getOne(id)
	}

	@Post()
	@Auth()
	async create(@Body() body: CreateSpaceDto) {
		const user = this.cls.get('user')
		return await this.spaceService.create(user.id, body)
	}

	@Post(':id')
	@Auth()
	async updateSpace(@Param("id") id: number, @Body() body: UpdateSpaceDto) {
		const user = this.cls.get('user')
		return await this.spaceService.updateSpace(id, user.id, body)
	}

	@Delete(':id')
	@Auth()
	async deleteSpace(@Param("id") id: number) {
		const user = this.cls.get('user')
		return await this.spaceService.deleteSpace(id, user.id)
	}
}
