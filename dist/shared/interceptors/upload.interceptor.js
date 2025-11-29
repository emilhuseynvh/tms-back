"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadInterceptor = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const upload_filter_utils_1 = require("../utils/upload-filter.utils");
let UploadInterceptor = class UploadInterceptor {
    static getInterceptor() {
        return (0, platform_express_1.FileInterceptor)('file', {
            storage: (0, multer_1.diskStorage)({
                destination: './uploads',
                filename: (req, file, callback) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    callback(null, file.fieldname + '-' + uniqueSuffix + (0, path_1.extname)(file.originalname));
                },
            }),
            fileFilter: upload_filter_utils_1.imageFileFilter
        });
    }
};
exports.UploadInterceptor = UploadInterceptor;
exports.UploadInterceptor = UploadInterceptor = __decorate([
    (0, common_1.Injectable)()
], UploadInterceptor);
//# sourceMappingURL=upload.interceptor.js.map