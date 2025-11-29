import { Repository } from "typeorm";
import { FolderEntity } from "../../entities/folder.entity";
import { CreateFolderDto } from "./dto/create-folder.dto";
import { UpdateFolderDto } from "./dto/update-folder.dto";
import { ClsService } from "nestjs-cls";
export declare class FolderService {
    private folderRepo;
    private cls;
    constructor(folderRepo: Repository<FolderEntity>, cls: ClsService);
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
