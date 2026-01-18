import { BaseEntity } from "typeorm";
import { UserEntity } from "./user.entity";
import { FolderEntity } from "./folder.entity";
import { TaskListEntity } from "./tasklist.entity";
export declare class SpaceEntity extends BaseEntity {
    id: number;
    name: string;
    description: string;
    order: number;
    ownerId: number;
    owner: UserEntity;
    folders: FolderEntity[];
    taskLists: TaskListEntity[];
    isArchived: boolean;
    archivedAt: Date | null;
    archivedById: number | null;
    archivedBy: UserEntity;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
