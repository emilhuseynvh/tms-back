import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { ActivityLogEntity, ActivityType } from "../../entities/activity-log.entity";
import { TaskEntity } from "../../entities/task.entity";
import { TaskListEntity } from "../../entities/tasklist.entity";
import { FolderEntity } from "../../entities/folder.entity";
import { SpaceEntity } from "../../entities/space.entity";
import { FilterActivityLogDto } from "./dto/filter-activity-log.dto";
import { ClsService } from "nestjs-cls";
import { RoleEnum } from "../../shared/enums/role.enum";
import { resolveFilterDateRange } from "../../shared/utils/filter-date.utils";

@Injectable()
export class ActivityLogService {
	constructor(
		@InjectRepository(ActivityLogEntity)
		private activityLogRepo: Repository<ActivityLogEntity>,
		@InjectRepository(TaskEntity)
		private taskRepo: Repository<TaskEntity>,
		@InjectRepository(TaskListEntity)
		private taskListRepo: Repository<TaskListEntity>,
		@InjectRepository(FolderEntity)
		private folderRepo: Repository<FolderEntity>,
		@InjectRepository(SpaceEntity)
		private spaceRepo: Repository<SpaceEntity>,
		private cls: ClsService
	) { }

	// Hər log üçün yerləşmə kontekstini (space / folder / list) və keçid linkini əlavə edir
	private async enrichWithContext(logs: ActivityLogEntity[]) {
		const taskIds: number[] = []
		const listIds: number[] = []
		const folderIds: number[] = []
		const spaceIds: number[] = []

		logs.forEach(log => {
			if (!log.entityId) return
			if (log.type.startsWith('task_')) taskIds.push(log.entityId)
			else if (log.type.startsWith('list_')) listIds.push(log.entityId)
			else if (log.type.startsWith('folder_')) folderIds.push(log.entityId)
			else if (log.type.startsWith('space_')) spaceIds.push(log.entityId)
		})

		const tasks = taskIds.length
			? await this.taskRepo.find({ where: { id: In(taskIds) }, withDeleted: true, select: ['id', 'taskListId', 'deletedAt'] })
			: []
		const taskMap = new Map(tasks.map(t => [t.id, t]))

		const allListIds = [...new Set([...listIds, ...tasks.map(t => t.taskListId).filter(Boolean)])]
		const lists = allListIds.length
			? await this.taskListRepo.find({ where: { id: In(allListIds) }, withDeleted: true, select: ['id', 'name', 'type', 'folderId', 'spaceId', 'deletedAt'] })
			: []
		const listMap = new Map(lists.map(l => [l.id, l]))

		const allFolderIds = [...new Set([...folderIds, ...lists.map(l => l.folderId).filter(Boolean)])]
		const folders = allFolderIds.length
			? await this.folderRepo.find({ where: { id: In(allFolderIds) }, withDeleted: true, select: ['id', 'name', 'spaceId', 'deletedAt'] })
			: []
		const folderMap = new Map(folders.map(f => [f.id, f]))

		const allSpaceIds = [...new Set([
			...spaceIds,
			...lists.map(l => l.spaceId).filter(Boolean),
			...folders.map(f => f.spaceId).filter(Boolean),
		])]
		const spaces = allSpaceIds.length
			? await this.spaceRepo.find({ where: { id: In(allSpaceIds) }, withDeleted: true, select: ['id', 'name', 'deletedAt'] })
			: []
		const spaceMap = new Map(spaces.map(s => [s.id, s]))

		logs.forEach(log => {
			let list: TaskListEntity | undefined
			let folder: FolderEntity | undefined
			let space: SpaceEntity | undefined
			let entityDeleted = false

			if (log.type.startsWith('task_')) {
				const task = taskMap.get(log.entityId)
				entityDeleted = !!task?.deletedAt
				if (task?.taskListId) list = listMap.get(task.taskListId)
			} else if (log.type.startsWith('list_')) {
				list = listMap.get(log.entityId)
				entityDeleted = !!list?.deletedAt
			} else if (log.type.startsWith('folder_')) {
				folder = folderMap.get(log.entityId)
				entityDeleted = !!folder?.deletedAt
			} else if (log.type.startsWith('space_')) {
				space = spaceMap.get(log.entityId)
				entityDeleted = !!space?.deletedAt
			}

			if (list) {
				if (list.folderId) folder = folderMap.get(list.folderId)
				if (list.spaceId) space = spaceMap.get(list.spaceId)
			}
			if (folder && !space && folder.spaceId) space = spaceMap.get(folder.spaceId)

			// Zəncirdə silinmiş element varsa link vermirik
			const chainDeleted = entityDeleted || !!list?.deletedAt || !!folder?.deletedAt || !!space?.deletedAt

			let url: string | null = null
			if (!chainDeleted && space) {
				const base = folder ? `/tasks/space/${space.id}/folder/${folder.id}` : `/tasks/space/${space.id}`
				if (list) {
					url = list.type === 'meeting' ? `${base}/note/${list.id}` : `${base}/list/${list.id}`
				} else {
					url = base
				}
			}

			(log as any).context = {
				spaceName: space?.name || null,
				folderName: folder?.name || null,
				listName: list?.name || null,
				url,
			}
		})
	}

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

		await this.enrichWithContext(data)

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
