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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FolderController = void 0;
const common_1 = require("@nestjs/common");
const folder_service_1 = require("./folder.service");
const create_folder_dto_1 = require("./dto/create-folder.dto");
const update_folder_dto_1 = require("./dto/update-folder.dto");
const swagger_1 = require("@nestjs/swagger");
const auth_decorator_1 = require("../../shared/decorators/auth.decorator");
const nestjs_cls_1 = require("nestjs-cls");
let FolderController = class FolderController {
    folderService;
    cls;
    constructor(folderService, cls) {
        this.folderService = folderService;
        this.cls = cls;
    }
    async listAll() {
        return await this.folderService.listAll();
    }
    async create(body) {
        const user = this.cls.get('user');
        return await this.folderService.create(user.id, body);
    }
    async myFolders() {
        const user = this.cls.get('user');
        return await this.folderService.listByOwner(user.id);
    }
    async listBySpace(spaceId) {
        return await this.folderService.listBySpace(Number(spaceId));
    }
    async getFullDetails(id, search) {
        return await this.folderService.getFullDetails(Number(id), search);
    }
    async reorderFolders(spaceId, body) {
        return await this.folderService.reorderFolders(Number(spaceId), body.folderIds);
    }
    async moveFolder(id, body) {
        return await this.folderService.moveFolder(Number(id), body.targetSpaceId);
    }
    async updateFolder(id, body) {
        const user = this.cls.get('user');
        return await this.folderService.updateFolder(Number(id), user.id, body);
    }
    async deleteFolder(id) {
        const user = this.cls.get('user');
        return await this.folderService.deleteFolder(Number(id), user.id);
    }
};
exports.FolderController = FolderController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FolderController.prototype, "listAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_folder_dto_1.CreateFolderDto]),
    __metadata("design:returntype", Promise)
], FolderController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, auth_decorator_1.Auth)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FolderController.prototype, "myFolders", null);
__decorate([
    (0, common_1.Get)('space/:spaceId'),
    __param(0, (0, common_1.Param)('spaceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FolderController.prototype, "listBySpace", null);
__decorate([
    (0, common_1.Get)(':id/full'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], FolderController.prototype, "getFullDetails", null);
__decorate([
    (0, common_1.Post)('reorder/:spaceId'),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Param)('spaceId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], FolderController.prototype, "reorderFolders", null);
__decorate([
    (0, common_1.Post)(':id/move'),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], FolderController.prototype, "moveFolder", null);
__decorate([
    (0, common_1.Post)(':id'),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_folder_dto_1.UpdateFolderDto]),
    __metadata("design:returntype", Promise)
], FolderController.prototype, "updateFolder", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FolderController.prototype, "deleteFolder", null);
exports.FolderController = FolderController = __decorate([
    (0, swagger_1.ApiTags)('folder'),
    (0, common_1.Controller)('folder'),
    __metadata("design:paramtypes", [folder_service_1.FolderService,
        nestjs_cls_1.ClsService])
], FolderController);
//# sourceMappingURL=folder.controller.js.map