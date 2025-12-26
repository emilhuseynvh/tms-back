import { Repository } from "typeorm";
import { SpaceEntity } from "../../entities/space.entity";
import { TaskEntity } from "../../entities/task.entity";
import { CreateSpaceDto } from "./dto/create-space.dto";
import { UpdateSpaceDto } from "./dto/update-space.dto";
import { ClsService } from "nestjs-cls";
import { ActivityLogService } from "../activity-log/activity-log.service";
export declare class SpaceService {
    private spaceRepo;
    private taskRepo;
    private cls;
    private activityLogService;
    constructor(spaceRepo: Repository<SpaceEntity>, taskRepo: Repository<TaskEntity>, cls: ClsService, activityLogService: ActivityLogService);
    create(ownerId: number, dto: CreateSpaceDto): Promise<SpaceEntity>;
    listAll(): Promise<SpaceEntity[]>;
    listByOwner(ownerId: number): Promise<SpaceEntity[]>;
    getOne(id: number): Promise<SpaceEntity>;
    updateSpace(id: number, userId: number, dto: UpdateSpaceDto): Promise<{
        message: string;
    }>;
    deleteSpace(id: number, userId: number): Promise<{
        message: string;
    }>;
}
