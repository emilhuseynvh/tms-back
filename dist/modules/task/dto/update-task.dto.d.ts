import { TaskStatus } from "../../../shared/enums/task.enum";
export declare class UpdateTaskDto {
    title?: string;
    description?: string;
    startAt?: string;
    dueAt?: string;
    status?: TaskStatus;
    assigneeId?: number;
    taskListId?: number;
}
