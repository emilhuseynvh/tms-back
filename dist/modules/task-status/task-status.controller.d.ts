import { TaskStatusService } from "./task-status.service";
import { CreateTaskStatusDto } from "./dto/create-task-status.dto";
import { UpdateTaskStatusDto } from "./dto/update-task-status.dto";
export declare class TaskStatusController {
    private taskStatusService;
    constructor(taskStatusService: TaskStatusService);
    list(): Promise<import("../../entities/task-status.entity").TaskStatusEntity[]>;
    getById(id: number): Promise<import("../../entities/task-status.entity").TaskStatusEntity>;
    create(body: CreateTaskStatusDto): Promise<import("../../entities/task-status.entity").TaskStatusEntity>;
    update(id: number, body: UpdateTaskStatusDto): Promise<import("../../entities/task-status.entity").TaskStatusEntity>;
    delete(id: number): Promise<{
        message: string;
    }>;
}
