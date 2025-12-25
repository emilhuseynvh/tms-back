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
    create(ownerId: number, dto: CreateFolderDto): Promise<FolderEntity>;
    listAll(): Promise<FolderEntity[]>;
    listByOwner(ownerId: number): Promise<FolderEntity[]>;
    updateFolder(id: number, userId: number, dto: UpdateFolderDto): Promise<{
        message: string;
    }>;
    deleteFolder(id: number, userId: number): Promise<{
        message: string;
    }>;
}
