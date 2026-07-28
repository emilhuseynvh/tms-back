import { Repository } from "typeorm";
import { ActivityLogEntity, ActivityType } from "../../entities/activity-log.entity";
import { TaskEntity } from "../../entities/task.entity";
import { TaskListEntity } from "../../entities/tasklist.entity";
import { FolderEntity } from "../../entities/folder.entity";
import { SpaceEntity } from "../../entities/space.entity";
import { FilterActivityLogDto } from "./dto/filter-activity-log.dto";
import { ClsService } from "nestjs-cls";
export declare class ActivityLogService {
    private activityLogRepo;
    private taskRepo;
    private taskListRepo;
    private folderRepo;
    private spaceRepo;
    private cls;
    constructor(activityLogRepo: Repository<ActivityLogEntity>, taskRepo: Repository<TaskEntity>, taskListRepo: Repository<TaskListEntity>, folderRepo: Repository<FolderEntity>, spaceRepo: Repository<SpaceEntity>, cls: ClsService);
    private enrichWithContext;
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
