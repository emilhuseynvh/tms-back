import { TaskService } from "./task.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { ReorderTaskDto } from "./dto/reorder-task.dto";
import { FilterTaskDto } from "./dto/filter-task.dto";
export declare class TaskController {
    private taskService;
    constructor(taskService: TaskService);
    getMyTasks(): Promise<import("../../entities/task.entity").TaskEntity[]>;
    listByTaskList(taskListId: number, filters: FilterTaskDto): Promise<import("../../entities/task.entity").TaskEntity[]>;
    create(body: CreateTaskDto): Promise<import("../../entities/task.entity").TaskEntity>;
    reorder(body: ReorderTaskDto): Promise<import("../../entities/task.entity").TaskEntity>;
    update(id: number, body: UpdateTaskDto): Promise<import("../../entities/task.entity").TaskEntity | null>;
    deleteTask(id: number): Promise<{
        message: string;
    }>;
    getTaskActivities(id: number, limit?: number): Promise<import("../../entities/task-activity.entity").TaskActivityEntity[]>;
}
