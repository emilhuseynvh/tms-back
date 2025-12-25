export declare class UpdateTaskDto {
    title?: string;
    description?: string;
    startAt?: string;
    dueAt?: string;
    is_message_send?: boolean;
    statusId?: number;
    assigneeIds?: number[];
    taskListId?: number;
    link?: string;
}
