import { Repository } from "typeorm";
import { TaskEntity } from "../../entities/task.entity";
import { TaskStatusEntity } from "../../entities/task-status.entity";
import { TaskActivityEntity } from "../../entities/task-activity.entity";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { ReorderTaskDto } from "./dto/reorder-task.dto";
import { FilterTaskDto } from "./dto/filter-task.dto";
import { ClsService } from "nestjs-cls";
import { ActivityLogService } from "../activity-log/activity-log.service";
import { NotificationService } from "../notification/notification.service";
import { NotificationGateway } from "../notification/notification.gateway";
export declare class TaskService {
    private taskRepo;
    private taskStatusRepo;
    private taskActivityRepo;
    private cls;
    private activityLogService;
    private notificationService;
    private notificationGateway;
    constructor(taskRepo: Repository<TaskEntity>, taskStatusRepo: Repository<TaskStatusEntity>, taskActivityRepo: Repository<TaskActivityEntity>, cls: ClsService, activityLogService: ActivityLogService, notificationService: NotificationService, notificationGateway: NotificationGateway);
    create(dto: CreateTaskDto): Promise<TaskEntity>;
    listByTaskList(taskListId: number, filters?: FilterTaskDto): Promise<TaskEntity[]>;
    private loadChildren;
    update(id: number, dto: UpdateTaskDto): Promise<TaskEntity | null>;
    private ensureStatusExists;
    private collectChanges;
    private logTaskActivity;
    reorder(params: ReorderTaskDto): Promise<TaskEntity>;
    deleteTask(id: number): Promise<{
        message: string;
    }>;
    getTaskActivities(taskId: number, limit?: number): Promise<TaskActivityEntity[]>;
    getMyTasks(): Promise<TaskEntity[]>;
}
