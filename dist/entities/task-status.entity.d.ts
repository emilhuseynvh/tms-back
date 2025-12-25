import { BaseEntity } from "typeorm";
import { TaskEntity } from "./task.entity";
export declare class TaskStatusEntity extends BaseEntity {
    id: number;
    name: string;
    color: string;
    icon: string;
    tasks: TaskEntity[];
    createdAt: Date;
    updatedAt: Date;
}
