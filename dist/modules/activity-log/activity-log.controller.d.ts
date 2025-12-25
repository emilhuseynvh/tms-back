import { ActivityLogService } from "./activity-log.service";
import { FilterActivityLogDto } from "./dto/filter-activity-log.dto";
export declare class ActivityLogController {
    private activityLogService;
    constructor(activityLogService: ActivityLogService);
    list(filters: FilterActivityLogDto): Promise<{
        data: import("../../entities/activity-log.entity").ActivityLogEntity[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
