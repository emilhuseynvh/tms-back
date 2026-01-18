import { TaskListService } from "./tasklist.service";
import { CreateTaskListDto } from "./dto/create-tasklist.dto";
import { UpdateTaskListDto } from "./dto/update-tasklist.dto";
import { FilterTaskListDto } from "./dto/filter-tasklist.dto";
export declare class TaskListController {
    private taskListService;
    constructor(taskListService: TaskListService);
    listByFolder(folderId: number, filters: FilterTaskListDto): Promise<import("../../entities/tasklist.entity").TaskListEntity[]>;
    listBySpace(spaceId: number): Promise<import("../../entities/tasklist.entity").TaskListEntity[]>;
    getOne(id: number): Promise<import("../../entities/tasklist.entity").TaskListEntity>;
    create(body: CreateTaskListDto): Promise<import("../../entities/tasklist.entity").TaskListEntity>;
    reorderTaskLists(body: {
        listIds: number[];
    }): Promise<{
        message: string;
    }>;
    moveTaskList(id: number, body: {
        targetFolderId?: number;
        targetSpaceId?: number;
    }): Promise<{
        message: string;
    }>;
    updateTaskList(id: number, body: UpdateTaskListDto): Promise<{
        message: string;
    }>;
    deleteTaskList(id: number): Promise<{
        message: string;
    }>;
}
