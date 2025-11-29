import { FolderService } from "./folder.service";
import { CreateFolderDto } from "./dto/create-folder.dto";
import { UpdateFolderDto } from "./dto/update-folder.dto";
import { ClsService } from "nestjs-cls";
export declare class FolderController {
    private folderService;
    private cls;
    constructor(folderService: FolderService, cls: ClsService);
    listAll(): Promise<any>;
    create(body: CreateFolderDto): Promise<any>;
    myFolders(): Promise<any>;
    updateFolder(id: number, body: UpdateFolderDto): Promise<{
        message: string;
    }>;
    deleteFolder(id: number): Promise<{
        message: string;
    }>;
}
