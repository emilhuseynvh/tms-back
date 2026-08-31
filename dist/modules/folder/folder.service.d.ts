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
import { FilterFolderDetailsDto } from "./dto/filter-folder-details.dto";
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
    private taskMatchesFilters;
    private hasActiveTaskFilters;
    private applyFolderFilters;
    private toPlainTask;
    private toPlainTaskLists;
    getFullDetails(id: number, filters?: FilterFolderDetailsDto): Promise<{
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
