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
        taskLists: {
            id: number;
            name: string;
            tasks: any[];
        }[];
        allTasks: any[];
        id: number;
        name: string;
        description: string;
        order: number;
        ownerId: number;
        owner: import("../../entities/user.entity").UserEntity;
        spaceId: number;
        space: import("../../entities/space.entity").SpaceEntity;
        assignees: import("../../entities/user.entity").UserEntity[];
        isArchived: boolean;
        archivedAt: Date | null;
        archivedById: number | null;
        archivedBy: import("../../entities/user.entity").UserEntity;
        deletedById: number;
        deletedBy: import("../../entities/user.entity").UserEntity;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
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
