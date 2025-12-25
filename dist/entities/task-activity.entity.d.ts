import { BaseEntity } from "typeorm";
import { TaskEntity } from "./task.entity";
export declare class TaskActivityEntity extends BaseEntity {
    id: number;
    taskId: number;
    task: TaskEntity;
    userId: number;
    username: string;
    changes: Record<string, unknown>;
    createdAt: Date;
}
