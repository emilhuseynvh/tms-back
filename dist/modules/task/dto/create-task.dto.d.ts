import { TaskStatus } from "../../../shared/enums/task.enum";
export declare class CreateTaskDto {
    title: string;
    description?: string;
    startAt?: string;
    dueAt?: string;
    taskListId: number;
    assigneeId?: number;
    status?: TaskStatus;
    parentId?: number;
}
