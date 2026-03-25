// uploads.controller.ts
import { Controller, Post, UploadedFile, UseInterceptors, ParseFilePipe, MaxFileSizeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UPLOAD_IMAGE_MAX_SIZE, UPLOAD_AUDIO_MAX_SIZE, UPLOAD_AUDIO_ALLOWED_MIME_TYPES } from '../../shared/constants/upload.constants';
import { Auth } from '../../shared/decorators/auth.decorator';
import { UplaodsService } from './uploads.service';
import { UploadInterceptor } from '../../shared/interceptors/upload.interceptor';
import { BadRequestException } from '@nestjs/common';

@Controller('uploads')
export class UploadsController {
    constructor(
        private uploadsService: UplaodsService
    ) { }
    
    @Post('image')
    @Auth()
    @UseInterceptors(UploadInterceptor.getInterceptor())
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                }
            },
        },
    })
    async uploadSingleFile(
        @UploadedFile(
            new ParseFilePipe({
                validators: [new MaxFileSizeValidator({ maxSize: UPLOAD_IMAGE_MAX_SIZE })],
            }),
        )
        file: Express.Multer.File,
    ) {
        return this.uploadsService.saveFile(file);
    }

    @Post('audio')
    @Auth()
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                callback(null, 'audio-' + uniqueSuffix + extname(file.originalname));
            },
        }),
        fileFilter: (req, file, callback) => {
            if (!UPLOAD_AUDIO_ALLOWED_MIME_TYPES.includes(file.mimetype)) {
                return callback(new BadRequestException('Yalnız MP3, WAV və OGG faylları yüklənə bilər!'), false);
            }
            callback(null, true);
        },
    }))
    @ApiConsumes('multipart/form-data')
    async uploadAudio(
        @UploadedFile(
            new ParseFilePipe({
                validators: [new MaxFileSizeValidator({ maxSize: UPLOAD_AUDIO_MAX_SIZE })],
            }),
        )
        file: Express.Multer.File,
    ) {
        return this.uploadsService.saveFile(file);
    }
}