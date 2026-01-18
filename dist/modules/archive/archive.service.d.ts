import { Repository } from "typeorm";
import { SpaceEntity } from "../../entities/space.entity";
import { FolderEntity } from "../../entities/folder.entity";
import { TaskListEntity } from "../../entities/tasklist.entity";
import { TaskEntity } from "../../entities/task.entity";
import { ClsService } from "nestjs-cls";
export declare class ArchiveService {
    private spaceRepo;
    private folderRepo;
    private taskListRepo;
    private taskRepo;
    private cls;
    constructor(spaceRepo: Repository<SpaceEntity>, folderRepo: Repository<FolderEntity>, taskListRepo: Repository<TaskListEntity>, taskRepo: Repository<TaskEntity>, cls: ClsService);
    getArchive(): Promise<{
        spaces: SpaceEntity[];
        folders: FolderEntity[];
        lists: TaskListEntity[];
        tasks: TaskEntity[];
    }>;
    archiveSpace(id: number): Promise<{
        message: string;
    }>;
    unarchiveSpace(id: number): Promise<{
        message: string;
    }>;
    archiveFolder(id: number): Promise<{
        message: string;
    }>;
    unarchiveFolder(id: number): Promise<{
        message: string;
    }>;
    archiveList(id: number): Promise<{
        message: string;
    }>;
    unarchiveList(id: number): Promise<{
        message: string;
    }>;
    archiveTask(id: number): Promise<{
        message: string;
    }>;
    unarchiveTask(id: number): Promise<{
        message: string;
    }>;
}
