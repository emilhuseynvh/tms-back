import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ActivityLogEntity, ActivityType } from "../../entities/activity-log.entity";
import { FilterActivityLogDto } from "./dto/filter-activity-log.dto";
import { ClsService } from "nestjs-cls";
import { RoleEnum } from "../../shared/enums/role.enum";
import { resolveFilterDateRange } from "../../shared/utils/filter-date.utils";

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

		const currentUser = this.cls.get('user')
		const isAdmin = currentUser?.role === RoleEnum.ADMIN

		const queryBuilder = this.activityLogRepo.createQueryBuilder('log')
			.leftJoinAndSelect('log.user', 'user')
			.orderBy('log.createdAt', 'DESC')

		if (isAdmin) {
			if (filters.userId) {
				queryBuilder.andWhere('log.userId = :userId', { userId: filters.userId })
			}
		} else if (currentUser?.id) {
			queryBuilder.andWhere('log.userId = :currentUserId', { currentUserId: currentUser.id })
		} else {
			queryBuilder.andWhere('1 = 0')
		}

		if (filters.type) {
			const matchingTypes = Object.values(ActivityType).filter(t => t.includes(filters.type as string))
			if (matchingTypes.length > 0) {
				queryBuilder.andWhere('log.type IN (:...types)', { types: matchingTypes })
			}
		}

		if (filters.search) {
			queryBuilder.andWhere(
				'(log.entityName LIKE :search OR log.description LIKE :search OR user.username LIKE :search)',
				{ search: `%${filters.search}%` }
			)
		}

		const { start: rangeStart, end: rangeEnd } = resolveFilterDateRange(
			filters.startDate,
			filters.endDate,
		)

		if (rangeStart && rangeEnd) {
			queryBuilder.andWhere(
				'log.createdAt >= :filterRangeStart AND log.createdAt <= :filterRangeEnd',
				{ filterRangeStart: rangeStart, filterRangeEnd: rangeEnd },
			)
		} else if (rangeStart) {
			queryBuilder.andWhere('log.createdAt >= :filterRangeStart', {
				filterRangeStart: rangeStart,
			})
		} else if (rangeEnd) {
			queryBuilder.andWhere('log.createdAt <= :filterRangeEnd', {
				filterRangeEnd: rangeEnd,
			})
		}

		if (filters.statusId != null && filters.statusId !== undefined) {
			queryBuilder.andWhere(
				`(
					(log.changes->'statusId'->>'to') IS NOT NULL AND (log.changes->'statusId'->>'to')::int = :filterStatusId
				) OR (
					(log.changes->'statusId'->>'from') IS NOT NULL AND (log.changes->'statusId'->>'from')::int = :filterStatusId
				)`,
				{ filterStatusId: filters.statusId }
			)
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
