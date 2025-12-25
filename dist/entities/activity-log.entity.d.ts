import { BaseEntity } from "typeorm";
import { UserEntity } from "./user.entity";
export declare enum ActivityType {
    FOLDER_CREATE = "folder_create",
    FOLDER_UPDATE = "folder_update",
    FOLDER_DELETE = "folder_delete",
    FOLDER_RESTORE = "folder_restore",
    LIST_CREATE = "list_create",
    LIST_UPDATE = "list_update",
    LIST_DELETE = "list_delete",
    LIST_RESTORE = "list_restore",
    TASK_CREATE = "task_create",
    TASK_UPDATE = "task_update",
    TASK_DELETE = "task_delete",
    TASK_RESTORE = "task_restore"
}
export declare class ActivityLogEntity extends BaseEntity {
    id: number;
    type: ActivityType;
    userId: number;
    user: UserEntity;
    entityId: number;
    entityName: string;
    changes: Record<string, unknown>;
    description: string;
    createdAt: Date;
}
