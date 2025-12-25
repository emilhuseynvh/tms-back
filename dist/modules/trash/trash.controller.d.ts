import { TrashService } from "./trash.service";
export declare class TrashController {
    private trashService;
    constructor(trashService: TrashService);
    getTrash(): Promise<{
        spaces: import("../../entities/space.entity").SpaceEntity[];
        folders: import("../../entities/folder.entity").FolderEntity[];
        lists: import("../../entities/tasklist.entity").TaskListEntity[];
        tasks: import("../../entities/task.entity").TaskEntity[];
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
