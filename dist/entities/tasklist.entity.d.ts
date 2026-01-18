import { BaseEntity } from "typeorm";
import { FolderEntity } from "./folder.entity";
import { TaskEntity } from "./task.entity";
import { SpaceEntity } from "./space.entity";
import { UserEntity } from "./user.entity";
export declare class TaskListEntity extends BaseEntity {
    id: number;
    name: string;
    order: number;
    folderId: number | null;
    folder: FolderEntity;
    spaceId: number | null;
    space: SpaceEntity;
    tasks: TaskEntity[];
    isArchived: boolean;
    archivedAt: Date | null;
    archivedById: number | null;
    archivedBy: UserEntity;
    deletedById: number;
    deletedBy: UserEntity;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
