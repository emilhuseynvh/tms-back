import { Repository } from "typeorm";
import { TaskListEntity } from "../../entities/tasklist.entity";
import { CreateTaskListDto } from "./dto/create-tasklist.dto";
import { UpdateTaskListDto } from "./dto/update-tasklist.dto";
import { FilterTaskListDto } from "./dto/filter-tasklist.dto";
import { ClsService } from "nestjs-cls";
import { ActivityLogService } from "../activity-log/activity-log.service";
export declare class TaskListService {
    private taskListRepo;
    private cls;
    private activityLogService;
    constructor(taskListRepo: Repository<TaskListEntity>, cls: ClsService, activityLogService: ActivityLogService);
    create(dto: CreateTaskListDto): Promise<TaskListEntity>;
    listByFolder(folderId: number, filters?: FilterTaskListDto): Promise<TaskListEntity[]>;
    updateTaskList(id: number, dto: UpdateTaskListDto): Promise<{
        message: string;
    }>;
    deleteTaskList(id: number): Promise<{
        message: string;
    }>;
}
