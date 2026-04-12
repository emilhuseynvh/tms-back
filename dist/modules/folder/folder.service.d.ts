import { Repository } from "typeorm";
import { FolderEntity } from "../../entities/folder.entity";
import { TaskListEntity } from "../../entities/tasklist.entity";
import { UserEntity } from "../../entities/user.entity";
import { CreateFolderDto } from "./dto/create-folder.dto";
import { UpdateFolderDto } from "./dto/update-folder.dto";
import { ClsService } from "nestjs-cls";
import { ActivityLogService } from "../activity-log/activity-log.service";
import { NotificationService } from "../notification/notification.service";
import { AssigneeDefaultsService } from "../../shared/services/assignee-defaults.service";
export declare class FolderService {
    private folderRepo;
    private taskListRepo;
    private assigneeDefaults;
    private cls;
    private activityLogService;
    private notificationService;
    constructor(folderRepo: Repository<FolderEntity>, taskListRepo: Repository<TaskListEntity>, assigneeDefaults: AssigneeDefaultsService, cls: ClsService, activityLogService: ActivityLogService, notificationService: NotificationService);
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
        assignees: UserEntity[];
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
            assignees: UserEntity[];
            isArchived: boolean;
            archivedAt: Date | null;
            archivedById: number | null;
            archivedBy: UserEntity;
            deletedById: number;
            deletedBy: UserEntity;
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
        owner: UserEntity;
        spaceId: number;
        space: import("../../entities/space.entity").SpaceEntity;
        assignees: UserEntity[];
        isArchived: boolean;
        archivedAt: Date | null;
        archivedById: number | null;
        archivedBy: UserEntity;
        deletedById: number;
        deletedBy: UserEntity;
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
