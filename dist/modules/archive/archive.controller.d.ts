import { ArchiveService } from "./archive.service";
export declare class ArchiveController {
    private archiveService;
    constructor(archiveService: ArchiveService);
    getArchive(): Promise<{
        spaces: import("../../entities/space.entity").SpaceEntity[];
        folders: import("../../entities/folder.entity").FolderEntity[];
        lists: import("../../entities/tasklist.entity").TaskListEntity[];
        tasks: import("../../entities/task.entity").TaskEntity[];
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
