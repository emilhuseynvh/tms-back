import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UploadsEntity } from '../../entities/uploads.entity';
import { InjectRepository } from '@nestjs/typeorm';
import config from '../../config';

@Injectable()
export class UplaodsService {
    constructor(
        @InjectRepository(UploadsEntity)
        private imageRepo: Repository<UploadsEntity>
    ) { }


    async saveFile(file: Express.Multer.File) {
        let result = await this.imageRepo.save({
            url: config.url + '/uploads/' + file.filename,
        });


        return result;
    }
}