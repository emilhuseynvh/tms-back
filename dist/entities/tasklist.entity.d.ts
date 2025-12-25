import { BaseEntity } from "typeorm";
import { FolderEntity } from "./folder.entity";
import { TaskEntity } from "./task.entity";
import { SpaceEntity } from "./space.entity";
export declare class TaskListEntity extends BaseEntity {
    id: number;
    name: string;
    folderId: number;
    folder: FolderEntity;
    spaceId: number;
    space: SpaceEntity;
    tasks: TaskEntity[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
