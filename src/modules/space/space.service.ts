import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SpaceEntity } from "../../entities/space.entity";
import { CreateSpaceDto } from "./dto/create-space.dto";
import { UpdateSpaceDto } from "./dto/update-space.dto";
import { ClsService } from "nestjs-cls";
import { ActivityLogService } from "../activity-log/activity-log.service";
import { ActivityType } from "../../entities/activity-log.entity";

@Injectable()
export class SpaceService {
	constructor(
		@InjectRepository(SpaceEntity)
		private spaceRepo: Repository<SpaceEntity>,
		private cls: ClsService,
		private activityLogService: ActivityLogService
	) { }

	async create(ownerId: number, dto: CreateSpaceDto) {
		const space = this.spaceRepo.create({ ...dto, ownerId })
		const savedSpace = await this.spaceRepo.save(space)

		await this.activityLogService.log(
			ActivityType.SPACE_CREATE,
			savedSpace.id,
			savedSpace.name,
			`"${savedSpace.name}" sahəsi yaradıldı`
		)

		return savedSpace
	}

	async listAll() {
		return await this.spaceRepo.find({
			order: { createdAt: 'DESC' },
			relations: ['folders', 'taskLists']
		})
	}

	async listByOwner(ownerId: number) {
		return await this.spaceRepo.find({
			where: { ownerId },
			order: { createdAt: 'DESC' },
			relations: ['folders', 'folders.taskLists', 'taskLists']
		})
	}

	async getOne(id: number) {
		const space = await this.spaceRepo.findOne({
			where: { id },
			relations: ['folders', 'folders.taskLists', 'taskLists']
		})

		if (!space) throw new NotFoundException('Sahə tapılmadı!')

		return space
	}

	async updateSpace(id: number, userId: number, dto: UpdateSpaceDto) {
		const space = await this.spaceRepo.findOne({ where: { id } })

		if (!space) throw new NotFoundException('Sahə tapılmadı!')

		const user = this.cls.get('user')
		if (user.role !== 'admin' && space.ownerId !== userId) {
			throw new UnauthorizedException('Sahəni yeniləmək üçün icazəniz yoxdur!')
		}

		const oldName = space.name
		Object.assign(space, dto)
		await this.spaceRepo.save(space)

		await this.activityLogService.log(
			ActivityType.SPACE_UPDATE,
			id,
			space.name,
			`"${oldName}" sahəsi yeniləndi`,
			{ ...dto }
		)

		return { message: "Sahə uğurla yeniləndi" }
	}

	async deleteSpace(id: number, userId: number) {
		const space = await this.spaceRepo.findOne({ where: { id } })

		if (!space) throw new NotFoundException('Sahə tapılmadı!')

		const user = this.cls.get('user')
		if (user.role !== 'admin' && space.ownerId !== userId) {
			throw new UnauthorizedException('Sahəni silmək üçün icazəniz yoxdur!')
		}

		await this.spaceRepo.softDelete({ id })

		await this.activityLogService.log(
			ActivityType.SPACE_DELETE,
			id,
			space.name,
			`"${space.name}" sahəsi silindi`
		)

		return { message: "Sahə uğurla silindi" }
	}
}
