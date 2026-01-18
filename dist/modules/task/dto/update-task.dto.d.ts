export declare class UpdateTaskDto {
    title?: string;
    description?: string;
    startAt?: string;
    dueAt?: string;
    statusId?: number;
    assigneeIds?: number[];
    taskListId?: number;
    link?: string;
    doc?: string;
    meetingNotes?: string;
    parentId?: number | null;
}
