import { FolderService } from "./folder.service";
import { CreateFolderDto } from "./dto/create-folder.dto";
import { UpdateFolderDto } from "./dto/update-folder.dto";
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
    }>;
    myFolders(): Promise<import("../../entities/folder.entity").FolderEntity[]>;
    listBySpace(spaceId: number): Promise<import("../../entities/folder.entity").FolderEntity[]>;
    getFullDetails(id: number, search?: string): Promise<{
        taskLists: {
            tasks: import("../../entities/task.entity").TaskEntity[];
            id: number;
            name: string;
            order: number;
            folderId: number | null;
            folder: import("../../entities/folder.entity").FolderEntity;
            spaceId: number | null;
            space: import("../../entities/space.entity").SpaceEntity;
            isArchived: boolean;
            archivedAt: Date | null;
            archivedById: number | null;
            archivedBy: import("../../entities/user.entity").UserEntity;
            deletedById: number;
            deletedBy: import("../../entities/user.entity").UserEntity;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date;
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
