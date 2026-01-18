import { BaseEntity } from "typeorm";
import { TaskEntity } from "./task.entity";
import { UserEntity } from "./user.entity";
export declare enum NotificationType {
    TASK_ASSIGNED = "task_assigned",
    TASK_DEADLINE = "task_deadline",
    TASK_UPDATED = "task_updated",
    TASK_UNASSIGNED = "task_unassigned"
}
export declare class NotificationEntity extends BaseEntity {
    id: number;
    userId: number;
    type: NotificationType;
    title: string;
    message: string;
    taskId: number | null;
    isRead: boolean;
    user: UserEntity;
    task: TaskEntity | null;
    createdAt: Date;
}
