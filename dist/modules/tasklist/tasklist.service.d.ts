import { Repository } from "typeorm";
import { TaskListEntity } from "../../entities/tasklist.entity";
import { CreateTaskListDto } from "./dto/create-tasklist.dto";
import { UpdateTaskListDto } from "./dto/update-tasklist.dto";
import { FilterTaskListDto } from "./dto/filter-tasklist.dto";
import { ClsService } from "nestjs-cls";
import { ActivityLogService } from "../activity-log/activity-log.service";
import { NotificationService } from "../notification/notification.service";
import { AssigneeDefaultsService } from "../../shared/services/assignee-defaults.service";
export declare class TaskListService {
    private taskListRepo;
    private assigneeDefaults;
    private cls;
    private activityLogService;
    private notificationService;
    constructor(taskListRepo: Repository<TaskListEntity>, assigneeDefaults: AssigneeDefaultsService, cls: ClsService, activityLogService: ActivityLogService, notificationService: NotificationService);
    create(dto: CreateTaskListDto): Promise<TaskListEntity>;
    listBySpace(spaceId: number): Promise<TaskListEntity[]>;
    getOne(id: number): Promise<TaskListEntity>;
    listByFolder(folderId: number, filters?: FilterTaskListDto): Promise<TaskListEntity[]>;
    updateTaskList(id: number, dto: UpdateTaskListDto): Promise<{
        message: string;
    }>;
    deleteTaskList(id: number): Promise<{
        message: string;
    }>;
    reorderTaskLists(listIds: number[]): Promise<{
        message: string;
    }>;
    moveTaskList(id: number, targetFolderId: number | null, targetSpaceId: number | null): Promise<{
        message: string;
    }>;
}
