import { TaskService } from "./task.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { ReorderTaskDto } from "./dto/reorder-task.dto";
import { FilterTaskDto } from "./dto/filter-task.dto";
export declare class TaskController {
    private taskService;
    constructor(taskService: TaskService);
    listByTaskList(taskListId: number, filters: FilterTaskDto): Promise<import("../../entities/task.entity").TaskEntity[]>;
    create(body: CreateTaskDto): Promise<any>;
    reorder(body: ReorderTaskDto): Promise<any>;
    update(id: number, body: UpdateTaskDto): Promise<any>;
    deleteTask(id: number): Promise<{
        message: string;
    }>;
}
