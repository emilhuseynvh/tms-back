"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLogService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const activity_log_entity_1 = require("../../entities/activity-log.entity");
const nestjs_cls_1 = require("nestjs-cls");
const role_enum_1 = require("../../shared/enums/role.enum");
const filter_date_utils_1 = require("../../shared/utils/filter-date.utils");
let ActivityLogService = class ActivityLogService {
    activityLogRepo;
    cls;
    constructor(activityLogRepo, cls) {
        this.activityLogRepo = activityLogRepo;
        this.cls = cls;
    }
    async log(type, entityId, entityName, description, changes) {
        const user = this.cls.get('user');
        const log = this.activityLogRepo.create({
            type,
            entityId,
            entityName,
            description,
            changes,
            userId: user?.id || null
        });
        return await this.activityLogRepo.save(log);
    }
    async list(filters) {
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;
        const currentUser = this.cls.get('user');
        const isAdmin = currentUser?.role === role_enum_1.RoleEnum.ADMIN;
        const queryBuilder = this.activityLogRepo.createQueryBuilder('log')
            .leftJoinAndSelect('log.user', 'user')
            .orderBy('log.createdAt', 'DESC');
        if (isAdmin) {
            if (filters.userId) {
                queryBuilder.andWhere('log.userId = :userId', { userId: filters.userId });
            }
        }
        else if (currentUser?.id) {
            queryBuilder.andWhere('log.userId = :currentUserId', { currentUserId: currentUser.id });
        }
        else {
            queryBuilder.andWhere('1 = 0');
        }
        if (filters.type) {
            const matchingTypes = Object.values(activity_log_entity_1.ActivityType).filter(t => t.includes(filters.type));
            if (matchingTypes.length > 0) {
                queryBuilder.andWhere('log.type IN (:...types)', { types: matchingTypes });
            }
        }
        if (filters.search) {
            queryBuilder.andWhere('(log.entityName LIKE :search OR log.description LIKE :search OR user.username LIKE :search)', { search: `%${filters.search}%` });
        }
        const { start: rangeStart, end: rangeEnd } = (0, filter_date_utils_1.resolveFilterDateRange)(filters.startDate, filters.endDate);
        if (rangeStart && rangeEnd) {
            queryBuilder.andWhere('log.createdAt >= :filterRangeStart AND log.createdAt <= :filterRangeEnd', { filterRangeStart: rangeStart, filterRangeEnd: rangeEnd });
        }
        else if (rangeStart) {
            queryBuilder.andWhere('log.createdAt >= :filterRangeStart', {
                filterRangeStart: rangeStart,
            });
        }
        else if (rangeEnd) {
            queryBuilder.andWhere('log.createdAt <= :filterRangeEnd', {
                filterRangeEnd: rangeEnd,
            });
        }
        if (filters.statusId != null && filters.statusId !== undefined) {
            queryBuilder.andWhere(`(
					(log.changes->'statusId'->>'to') IS NOT NULL AND (log.changes->'statusId'->>'to')::int = :filterStatusId
				) OR (
					(log.changes->'statusId'->>'from') IS NOT NULL AND (log.changes->'statusId'->>'from')::int = :filterStatusId
				)`, { filterStatusId: filters.statusId });
        }
        const [data, total] = await queryBuilder
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
};
exports.ActivityLogService = ActivityLogService;
exports.ActivityLogService = ActivityLogService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(activity_log_entity_1.ActivityLogEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        nestjs_cls_1.ClsService])
], ActivityLogService);
//# sourceMappingURL=activity-log.service.js.map