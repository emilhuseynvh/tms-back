import { BaseEntity } from "typeorm";
import { TaskListEntity } from "./tasklist.entity";
import { UserEntity } from "./user.entity";
import { TaskStatus } from "../shared/enums/task.enum";
export declare class TaskEntity extends BaseEntity {
    id: number;
    title: string;
    description: string;
    startAt: Date | null;
    dueAt: Date | null;
    status: TaskStatus;
    order: number;
    taskListId: number;
    taskList: TaskListEntity;
    assigneeId: number;
    assignee: UserEntity;
    parentId: number;
    parent: TaskEntity;
    children: TaskEntity[];
    createdAt: Date;
    updatedAt: Date;
}
