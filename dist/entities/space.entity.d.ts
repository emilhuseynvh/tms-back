import { BaseEntity } from "typeorm";
import { UserEntity } from "./user.entity";
import { FolderEntity } from "./folder.entity";
import { TaskListEntity } from "./tasklist.entity";
export declare class SpaceEntity extends BaseEntity {
    id: number;
    name: string;
    description: string;
    ownerId: number;
    owner: UserEntity;
    folders: FolderEntity[];
    taskLists: TaskListEntity[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
