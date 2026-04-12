import { BaseEntity } from "typeorm";
import { TaskEntity } from "./task.entity";
import { UserEntity } from "./user.entity";
import { SpaceEntity } from "./space.entity";
import { FolderEntity } from "./folder.entity";
import { TaskListEntity } from "./tasklist.entity";
export declare enum NotificationType {
    TASK_ASSIGNED = "task_assigned",
    TASK_DEADLINE = "task_deadline",
    TASK_UPDATED = "task_updated",
    TASK_UNASSIGNED = "task_unassigned",
    SPACE_ASSIGNED = "space_assigned",
    SPACE_UNASSIGNED = "space_unassigned",
    FOLDER_ASSIGNED = "folder_assigned",
    FOLDER_UNASSIGNED = "folder_unassigned",
    LIST_ASSIGNED = "list_assigned",
    LIST_UNASSIGNED = "list_unassigned"
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
    spaceId: number | null;
    space: SpaceEntity | null;
    folderId: number | null;
    folder: FolderEntity | null;
    listId: number | null;
    list: TaskListEntity | null;
    createdAt: Date;
}
