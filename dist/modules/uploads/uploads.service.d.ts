import { Repository } from 'typeorm';
import { UploadsEntity } from '../../entities/uploads.entity';
export declare class UplaodsService {
    private imageRepo;
    constructor(imageRepo: Repository<UploadsEntity>);
    saveFile(file: Express.Multer.File): Promise<any>;
}
