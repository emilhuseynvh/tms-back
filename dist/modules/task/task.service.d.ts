import { Repository } from "typeorm";
import { TaskEntity } from "../../entities/task.entity";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { ReorderTaskDto } from "./dto/reorder-task.dto";
import { FilterTaskDto } from "./dto/filter-task.dto";
import { ClsService } from "nestjs-cls";
export declare class TaskService {
    private taskRepo;
    private cls;
    constructor(taskRepo: Repository<TaskEntity>, cls: ClsService);
    create(dto: CreateTaskDto): Promise<any>;
    listByTaskList(taskListId: number, filters?: FilterTaskDto): Promise<TaskEntity[]>;
    private loadChildren;
    update(id: number, dto: UpdateTaskDto): Promise<any>;
    reorder(params: ReorderTaskDto): Promise<any>;
    deleteTask(id: number): Promise<{
        message: string;
    }>;
}
