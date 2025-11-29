import { Injectable } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { imageFileFilter } from '../utils/upload-filter.utils';

@Injectable()
export class UploadInterceptor {
  static getInterceptor() {
    return FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
        },
        
      }),
      fileFilter: imageFileFilter
    });
  }
}
