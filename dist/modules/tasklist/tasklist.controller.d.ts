import { TaskListService } from "./tasklist.service";
import { CreateTaskListDto } from "./dto/create-tasklist.dto";
import { UpdateTaskListDto } from "./dto/update-tasklist.dto";
import { FilterTaskListDto } from "./dto/filter-tasklist.dto";
export declare class TaskListController {
    private taskListService;
    constructor(taskListService: TaskListService);
    listByFolder(folderId: number, filters: FilterTaskListDto): Promise<import("../../entities/tasklist.entity").TaskListEntity[]>;
    create(body: CreateTaskListDto): Promise<import("../../entities/tasklist.entity").TaskListEntity>;
    updateTaskList(id: number, body: UpdateTaskListDto): Promise<{
        message: string;
    }>;
    deleteTaskList(id: number): Promise<{
        message: string;
    }>;
}
