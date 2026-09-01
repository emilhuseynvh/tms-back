import { Repository } from "typeorm";
import { SpaceEntity } from "../../entities/space.entity";
import { TaskEntity } from "../../entities/task.entity";
import { TaskListEntity } from "../../entities/tasklist.entity";
import { UserEntity } from "../../entities/user.entity";
import { CreateSpaceDto } from "./dto/create-space.dto";
import { UpdateSpaceDto } from "./dto/update-space.dto";
import { ClsService } from "nestjs-cls";
import { ActivityLogService } from "../activity-log/activity-log.service";
import { NotificationService } from "../notification/notification.service";
import { AssigneeDefaultsService } from "../../shared/services/assignee-defaults.service";
import { FilterSpaceDetailsDto } from "./dto/filter-space-details.dto";
import { FolderService } from "../folder/folder.service";
export declare class SpaceService {
    private spaceRepo;
    private taskRepo;
    private taskListRepo;
    private assigneeDefaults;
    private cls;
    private activityLogService;
    private notificationService;
    private folderService;
    constructor(spaceRepo: Repository<SpaceEntity>, taskRepo: Repository<TaskEntity>, taskListRepo: Repository<TaskListEntity>, assigneeDefaults: AssigneeDefaultsService, cls: ClsService, activityLogService: ActivityLogService, notificationService: NotificationService, folderService: FolderService);
    create(ownerId: number, dto: CreateSpaceDto): Promise<{
        taskLists: TaskListEntity[];
        folders: never[];
        id: number;
        name: string;
        description: string;
        order: number;
        ownerId: number;
        owner: UserEntity;
        assignees: UserEntity[];
        isArchived: boolean;
        archivedAt: Date | null;
        archivedById: number | null;
        archivedBy: UserEntity;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
    }>;
    listAll(): Promise<SpaceEntity[]>;
    listByOwner(ownerId: number): Promise<SpaceEntity[]>;
    private withVisibleFolders;
    getOne(id: number): Promise<SpaceEntity>;
    private taskMatchesFilters;
    private hasActiveTaskFilters;
    private applyListFilters;
    getFullDetails(id: number, filters?: FilterSpaceDetailsDto): Promise<{
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
        owner: UserEntity;
        taskLists: TaskListEntity[];
        assignees: UserEntity[];
        isArchived: boolean;
        archivedAt: Date | null;
        archivedById: number | null;
        archivedBy: UserEntity;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
    }>;
    updateSpace(id: number, userId: number, dto: UpdateSpaceDto): Promise<{
        message: string;
    }>;
    deleteSpace(id: number, userId: number): Promise<{
        message: string;
    }>;
    reorderSpaces(spaceIds: number[]): Promise<{
        message: string;
    }>;
}
