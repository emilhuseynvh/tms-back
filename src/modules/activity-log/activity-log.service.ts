import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ActivityLogEntity, ActivityType } from "../../entities/activity-log.entity";
import { FilterActivityLogDto } from "./dto/filter-activity-log.dto";
import { ClsService } from "nestjs-cls";

@Injectable()
export class ActivityLogService {
	constructor(
		@InjectRepository(ActivityLogEntity)
		private activityLogRepo: Repository<ActivityLogEntity>,
		private cls: ClsService
	) { }

	async log(
		type: ActivityType,
		entityId: number,
		entityName: string,
		description?: string,
		changes?: Record<string, unknown>
	) {
		const user = this.cls.get('user')
		const log = this.activityLogRepo.create({
			type,
			entityId,
			entityName,
			description,
			changes,
			userId: user?.id || null
		})
		return await this.activityLogRepo.save(log)
	}

	async list(filters: FilterActivityLogDto) {
		const page = filters.page || 1
		const limit = filters.limit || 20
		const skip = (page - 1) * limit

		const queryBuilder = this.activityLogRepo.createQueryBuilder('log')
			.leftJoinAndSelect('log.user', 'user')
			.orderBy('log.createdAt', 'DESC')

		if (filters.userId) {
			queryBuilder.andWhere('log.userId = :userId', { userId: filters.userId })
		}

		if (filters.type) {
			queryBuilder.andWhere('log.type = :type', { type: filters.type })
		}

		if (filters.search) {
			queryBuilder.andWhere(
				'(log.entityName ILIKE :search OR log.description ILIKE :search OR user.username ILIKE :search)',
				{ search: `%${filters.search}%` }
			)
		}

		if (filters.startDate) {
			queryBuilder.andWhere('log.createdAt >= :startDate', { startDate: filters.startDate })
		}

		if (filters.endDate) {
			queryBuilder.andWhere('log.createdAt <= :endDate', { endDate: filters.endDate })
		}

		const [data, total] = await queryBuilder
			.skip(skip)
			.take(limit)
			.getManyAndCount()

		return {
			data,
			meta: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit)
			}
		}
	}
}
