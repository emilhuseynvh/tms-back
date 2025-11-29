import { Repository } from "typeorm";
import { TaskListEntity } from "../../entities/tasklist.entity";
import { CreateTaskListDto } from "./dto/create-tasklist.dto";
import { UpdateTaskListDto } from "./dto/update-tasklist.dto";
import { FilterTaskListDto } from "./dto/filter-tasklist.dto";
import { ClsService } from "nestjs-cls";
export declare class TaskListService {
    private taskListRepo;
    private cls;
    constructor(taskListRepo: Repository<TaskListEntity>, cls: ClsService);
    create(dto: CreateTaskListDto): Promise<any>;
    listByFolder(folderId: number, filters?: FilterTaskListDto): Promise<any>;
    updateTaskList(id: number, dto: UpdateTaskListDto): Promise<{
        message: string;
    }>;
    deleteTaskList(id: number): Promise<{
        message: string;
    }>;
}
