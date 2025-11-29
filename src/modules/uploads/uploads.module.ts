import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UplaodsService } from './uploads.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadsEntity } from '../../entities/uploads.entity';

@Module({
    imports: [TypeOrmModule.forFeature([UploadsEntity])],
    controllers: [UploadsController],
    providers: [UplaodsService],
})
export class UploadsModule { };