import { Repository } from "typeorm";
import { FolderEntity } from "../../entities/folder.entity";
import { TaskListEntity } from "../../entities/tasklist.entity";
import { CreateFolderDto } from "./dto/create-folder.dto";
import { UpdateFolderDto } from "./dto/update-folder.dto";
import { ClsService } from "nestjs-cls";
import { ActivityLogService } from "../activity-log/activity-log.service";
export declare class FolderService {
    private folderRepo;
    private taskListRepo;
    private cls;
    private activityLogService;
    constructor(folderRepo: Repository<FolderEntity>, taskListRepo: Repository<TaskListEntity>, cls: ClsService, activityLogService: ActivityLogService);
    create(ownerId: number, dto: CreateFolderDto): Promise<{
        id: number;
        name: string;
        description: string;
        spaceId: number;
        ownerId: number;
        createdAt: Date;
        updatedAt: Date;
        taskLists: TaskListEntity[];
        defaultListId: number;
    }>;
    listAll(): Promise<FolderEntity[]>;
    listByOwner(ownerId: number): Promise<FolderEntity[]>;
    listBySpace(spaceId: number): Promise<FolderEntity[]>;
    getFullDetails(id: number, search?: string): Promise<{
        taskLists: {
            tasks: import("../../entities/task.entity").TaskEntity[];
            id: number;
            name: string;
            order: number;
            folderId: number | null;
            folder: FolderEntity;
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
    updateFolder(id: number, userId: number, dto: UpdateFolderDto): Promise<{
        message: string;
    }>;
    deleteFolder(id: number, userId: number): Promise<{
        message: string;
    }>;
    reorderFolders(spaceId: number, folderIds: number[]): Promise<{
        message: string;
    }>;
    moveFolder(id: number, targetSpaceId: number): Promise<{
        message: string;
    }>;
}
