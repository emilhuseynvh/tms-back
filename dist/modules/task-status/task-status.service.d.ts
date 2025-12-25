import { Repository } from "typeorm";
import { TaskStatusEntity } from "../../entities/task-status.entity";
import { CreateTaskStatusDto } from "./dto/create-task-status.dto";
import { UpdateTaskStatusDto } from "./dto/update-task-status.dto";
export declare class TaskStatusService {
    private taskStatusRepo;
    constructor(taskStatusRepo: Repository<TaskStatusEntity>);
    list(): Promise<TaskStatusEntity[]>;
    getById(id: number): Promise<TaskStatusEntity>;
    create(dto: CreateTaskStatusDto): Promise<TaskStatusEntity>;
    update(id: number, dto: UpdateTaskStatusDto): Promise<TaskStatusEntity>;
    delete(id: number): Promise<{
        message: string;
    }>;
}
