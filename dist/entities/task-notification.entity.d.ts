import { BaseEntity } from "typeorm";
import { TaskEntity } from "./task.entity";
import { UserEntity } from "./user.entity";
export declare class TaskNotificationEntity extends BaseEntity {
    id: number;
    taskId: number;
    userId: number;
    notifiedAt: Date | null;
    task: TaskEntity;
    user: UserEntity;
    createdAt: Date;
}
