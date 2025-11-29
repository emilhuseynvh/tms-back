import { UplaodsService } from './uploads.service';
export declare class UploadsController {
    private uploadsService;
    constructor(uploadsService: UplaodsService);
    uploadSingleFile(file: Express.Multer.File): Promise<{
        url: string;
    } & import("../../entities/uploads.entity").UploadsEntity>;
}
