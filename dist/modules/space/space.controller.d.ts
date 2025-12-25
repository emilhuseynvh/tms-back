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
    create(body: CreateSpaceDto): Promise<import("../../entities/space.entity").SpaceEntity>;
    updateSpace(id: number, body: UpdateSpaceDto): Promise<{
        message: string;
    }>;
    deleteSpace(id: number): Promise<{
        message: string;
    }>;
}
