"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const upload_constants_1 = require("../../shared/constants/upload.constants");
const auth_decorator_1 = require("../../shared/decorators/auth.decorator");
const uploads_service_1 = require("./uploads.service");
const upload_interceptor_1 = require("../../shared/interceptors/upload.interceptor");
let UploadsController = class UploadsController {
    uploadsService;
    constructor(uploadsService) {
        this.uploadsService = uploadsService;
    }
    async uploadSingleFile(file) {
        return this.uploadsService.saveFile(file);
    }
};
exports.UploadsController = UploadsController;
__decorate([
    (0, common_1.Post)('image'),
    (0, auth_decorator_1.Auth)(),
    (0, common_1.UseInterceptors)(upload_interceptor_1.UploadInterceptor.getInterceptor()),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                }
            },
        },
    }),
    __param(0, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [new common_1.MaxFileSizeValidator({ maxSize: upload_constants_1.UPLOAD_IMAGE_MAX_SIZE })],
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof Express !== "undefined" && (_a = Express.Multer) !== void 0 && _a.File) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "uploadSingleFile", null);
exports.UploadsController = UploadsController = __decorate([
    (0, common_1.Controller)('uploads'),
    __metadata("design:paramtypes", [uploads_service_1.UplaodsService])
], UploadsController);
//# sourceMappingURL=uploads.controller.js.map