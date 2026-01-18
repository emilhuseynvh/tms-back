export declare class CreateTaskDto {
    title: string;
    description?: string;
    startAt?: string;
    dueAt?: string;
    taskListId: number;
    assigneeIds?: number[];
    statusId?: number;
    parentId?: number;
    link?: string;
    doc?: string;
    meetingNotes?: string;
}
