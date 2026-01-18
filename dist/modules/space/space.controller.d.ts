import { SpaceService } from "./space.service";
import { CreateSpaceDto } from "./dto/create-space.dto";
import { UpdateSpaceDto } from "./dto/update-space.dto";
import { ClsService } from "nestjs-cls";
export declare class SpaceController {
    private spaceService;
    private cls;
    constructor(spaceService: SpaceService, cls: ClsService);
    listAll(): Promise<import("../../entities/space.entity").SpaceEntity[]>;
    mySpaces(): Promise<import("../../entities/space.entity").SpaceEntity[]>;
    getOne(id: number): Promise<import("../../entities/space.entity").SpaceEntity>;
    getFullDetails(id: number, search?: string): Promise<{
        folders: {
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
        }[];
        directLists: {
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
        taskLists: import("../../entities/tasklist.entity").TaskListEntity[];
        isArchived: boolean;
        archivedAt: Date | null;
        archivedById: number | null;
        archivedBy: import("../../entities/user.entity").UserEntity;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
    }>;
    create(body: CreateSpaceDto): Promise<import("../../entities/space.entity").SpaceEntity>;
    reorderSpaces(body: {
        spaceIds: number[];
    }): Promise<{
        message: string;
    }>;
    updateSpace(id: number, body: UpdateSpaceDto): Promise<{
        message: string;
    }>;
    deleteSpace(id: number): Promise<{
        message: string;
    }>;
}
