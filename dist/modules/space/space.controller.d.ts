import { SpaceService } from "./space.service";
import { CreateSpaceDto } from "./dto/create-space.dto";
import { UpdateSpaceDto } from "./dto/update-space.dto";
import { FilterSpaceDetailsDto } from "./dto/filter-space-details.dto";
import { ClsService } from "nestjs-cls";
export declare class SpaceController {
    private spaceService;
    private cls;
    constructor(spaceService: SpaceService, cls: ClsService);
    listAll(): Promise<import("../../entities/space.entity").SpaceEntity[]>;
    mySpaces(): Promise<import("../../entities/space.entity").SpaceEntity[]>;
    getOne(id: number): Promise<import("../../entities/space.entity").SpaceEntity>;
    getFullDetails(id: number, filters: FilterSpaceDetailsDto): Promise<{
        folders: any[];
        directLists: {
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
        taskLists: import("../../entities/tasklist.entity").TaskListEntity[];
        assignees: import("../../entities/user.entity").UserEntity[];
        isArchived: boolean;
        archivedAt: Date | null;
        archivedById: number | null;
        archivedBy: import("../../entities/user.entity").UserEntity;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
    }>;
    create(body: CreateSpaceDto): Promise<{
        taskLists: import("../../entities/tasklist.entity").TaskListEntity[];
        folders: never[];
        id: number;
        name: string;
        description: string;
        order: number;
        ownerId: number;
        owner: import("../../entities/user.entity").UserEntity;
        assignees: import("../../entities/user.entity").UserEntity[];
        isArchived: boolean;
        archivedAt: Date | null;
        archivedById: number | null;
        archivedBy: import("../../entities/user.entity").UserEntity;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
    }>;
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
