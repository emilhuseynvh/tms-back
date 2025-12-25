import { BaseEntity } from "typeorm";
import { FolderEntity } from "./folder.entity";
import { TaskEntity } from "./task.entity";
export declare class TaskListEntity extends BaseEntity {
    id: number;
    name: string;
    folderId: number;
    folder: FolderEntity;
    tasks: TaskEntity[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
