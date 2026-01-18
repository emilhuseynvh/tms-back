import { BaseEntity } from "typeorm";
import { UserEntity } from "./user.entity";
import { TaskListEntity } from "./tasklist.entity";
import { SpaceEntity } from "./space.entity";
export declare class FolderEntity extends BaseEntity {
    id: number;
    name: string;
    description: string;
    order: number;
    ownerId: number;
    owner: UserEntity;
    spaceId: number;
    space: SpaceEntity;
    taskLists: TaskListEntity[];
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
