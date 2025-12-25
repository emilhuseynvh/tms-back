import { Repository } from "typeorm";
import { SpaceEntity } from "../../entities/space.entity";
import { FolderEntity } from "../../entities/folder.entity";
import { TaskListEntity } from "../../entities/tasklist.entity";
import { TaskEntity } from "../../entities/task.entity";
import { ActivityLogService } from "../activity-log/activity-log.service";
import { ClsService } from "nestjs-cls";
export declare class TrashService {
    private spaceRepo;
    private folderRepo;
    private taskListRepo;
    private taskRepo;
    private activityLogService;
    private cls;
    constructor(spaceRepo: Repository<SpaceEntity>, folderRepo: Repository<FolderEntity>, taskListRepo: Repository<TaskListEntity>, taskRepo: Repository<TaskEntity>, activityLogService: ActivityLogService, cls: ClsService);
    getTrash(): Promise<{
        spaces: SpaceEntity[];
        folders: FolderEntity[];
        lists: TaskListEntity[];
        tasks: TaskEntity[];
    }>;
    restoreSpace(id: number): Promise<{
        message: string;
    }>;
    restoreFolder(id: number): Promise<{
        message: string;
    }>;
    restoreList(id: number): Promise<{
        message: string;
    }>;
    restoreTask(id: number): Promise<{
        message: string;
    }>;
    permanentDeleteSpace(id: number): Promise<{
        message: string;
    }>;
    permanentDeleteFolder(id: number): Promise<{
        message: string;
    }>;
    permanentDeleteList(id: number): Promise<{
        message: string;
    }>;
    permanentDeleteTask(id: number): Promise<{
        message: string;
    }>;
}
