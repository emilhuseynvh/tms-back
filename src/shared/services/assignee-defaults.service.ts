import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserEntity } from '../../entities/user.entity'
import { RoleEnum } from '../enums/role.enum'

@Injectable()
export class AssigneeDefaultsService {
	constructor(
		@InjectRepository(UserEntity)
		private userRepo: Repository<UserEntity>,
	) {}

	async getAdminUserIds(): Promise<number[]> {
		const admins = await this.userRepo.find({
			where: { role: RoleEnum.ADMIN },
			select: { id: true },
			order: { id: 'ASC' },
		})
		return admins.map((u) => u.id)
	}

	/** Sahə, qovluq, siyahı: yaradan + bütün adminlər + istəyə görə əlavə assignee-lər */
	async mergeResourceAssignees(
		dtoAssigneeIds: number[] | undefined,
		creatorId: number | undefined,
	): Promise<number[]> {
		const adminIds = await this.getAdminUserIds()
		const merged = new Set<number>()
		for (const id of adminIds) merged.add(id)
		if (creatorId) merged.add(creatorId)
		for (const id of dtoAssigneeIds || []) merged.add(id)
		return [...merged]
	}

	/** Tapşırıq: assignee göndərilməyibsə yalnız yaradan təyin olunur (admin avtomatik əlavə olunmur) */
	resolveTaskAssigneeIds(
		dtoAssigneeIds: number[] | undefined,
		creatorId: number | undefined,
	): number[] {
		if (dtoAssigneeIds?.length) return dtoAssigneeIds
		return creatorId ? [creatorId] : []
	}
}
