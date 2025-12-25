import { Repository } from "typeorm";
import { ActivityLogEntity, ActivityType } from "../../entities/activity-log.entity";
import { FilterActivityLogDto } from "./dto/filter-activity-log.dto";
import { ClsService } from "nestjs-cls";
export declare class ActivityLogService {
    private activityLogRepo;
    private cls;
    constructor(activityLogRepo: Repository<ActivityLogEntity>, cls: ClsService);
    log(type: ActivityType, entityId: number, entityName: string, description?: string, changes?: Record<string, unknown>): Promise<ActivityLogEntity>;
    list(filters: FilterActivityLogDto): Promise<{
        data: ActivityLogEntity[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
