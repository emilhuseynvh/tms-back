import { BaseEntity } from "typeorm";
import { UserEntity } from "./user.entity";
import { TaskListEntity } from "./tasklist.entity";
export declare class FolderEntity extends BaseEntity {
    id: number;
    name: string;
    description: string;
    ownerId: number;
    owner: UserEntity;
    taskLists: TaskListEntity[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
