import { FolderService } from "./folder.service";
import { CreateFolderDto } from "./dto/create-folder.dto";
import { UpdateFolderDto } from "./dto/update-folder.dto";
import { FilterFolderDetailsDto } from "./dto/filter-folder-details.dto";
import { ClsService } from "nestjs-cls";
export declare class FolderController {
    private folderService;
    private cls;
    constructor(folderService: FolderService, cls: ClsService);
    listAll(): Promise<import("../../entities/folder.entity").FolderEntity[]>;
    create(body: CreateFolderDto): Promise<{
        id: number;
        name: string;
        description: string;
        spaceId: number;
        ownerId: number;
        createdAt: Date;
        updatedAt: Date;
        taskLists: import("../../entities/tasklist.entity").TaskListEntity[];
        defaultListId: number;
        assignees: import("../../entities/user.entity").UserEntity[];
    }>;
    myFolders(): Promise<import("../../entities/folder.entity").FolderEntity[]>;
    listBySpace(spaceId: number): Promise<import("../../entities/folder.entity").FolderEntity[]>;
    getFullDetails(id: number, filters: FilterFolderDetailsDto): Promise<{
        id: number;
        name: string;
        description: string;
        spaceId: number;
        ownerId: number;
        order: number;
        createdAt: Date;
        updatedAt: Date;
        space: {
            id: number;
            name: string;
        } | null;
        taskLists: {
            id: number;
            name: string;
            tasks: any[];
        }[];
        allTasks: any[];
    }>;
    reorderFolders(spaceId: number, body: {
        folderIds: number[];
    }): Promise<{
        message: string;
    }>;
    moveFolder(id: number, body: {
        targetSpaceId: number;
    }): Promise<{
        message: string;
    }>;
    updateFolder(id: number, body: UpdateFolderDto): Promise<{
        message: string;
    }>;
    deleteFolder(id: number): Promise<{
        message: string;
    }>;
}
