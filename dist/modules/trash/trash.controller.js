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
exports.TrashController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const trash_service_1 = require("./trash.service");
const auth_decorator_1 = require("../../shared/decorators/auth.decorator");
let TrashController = class TrashController {
    trashService;
    constructor(trashService) {
        this.trashService = trashService;
    }
    async getTrash() {
        return await this.trashService.getTrash();
    }
    async restoreSpace(id) {
        return await this.trashService.restoreSpace(id);
    }
    async restoreFolder(id) {
        return await this.trashService.restoreFolder(id);
    }
    async restoreList(id) {
        return await this.trashService.restoreList(id);
    }
    async restoreTask(id) {
        return await this.trashService.restoreTask(id);
    }
    async permanentDeleteSpace(id) {
        return await this.trashService.permanentDeleteSpace(id);
    }
    async permanentDeleteFolder(id) {
        return await this.trashService.permanentDeleteFolder(id);
    }
    async permanentDeleteList(id) {
        return await this.trashService.permanentDeleteList(id);
    }
    async permanentDeleteTask(id) {
        return await this.trashService.permanentDeleteTask(id);
    }
};
exports.TrashController = TrashController;
__decorate([
    (0, common_1.Get)(),
    (0, auth_decorator_1.Auth)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TrashController.prototype, "getTrash", null);
__decorate([
    (0, common_1.Post)('restore/space/:id'),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TrashController.prototype, "restoreSpace", null);
__decorate([
    (0, common_1.Post)('restore/folder/:id'),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TrashController.prototype, "restoreFolder", null);
__decorate([
    (0, common_1.Post)('restore/list/:id'),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TrashController.prototype, "restoreList", null);
__decorate([
    (0, common_1.Post)('restore/task/:id'),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TrashController.prototype, "restoreTask", null);
__decorate([
    (0, common_1.Delete)('space/:id'),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TrashController.prototype, "permanentDeleteSpace", null);
__decorate([
    (0, common_1.Delete)('folder/:id'),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TrashController.prototype, "permanentDeleteFolder", null);
__decorate([
    (0, common_1.Delete)('list/:id'),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TrashController.prototype, "permanentDeleteList", null);
__decorate([
    (0, common_1.Delete)('task/:id'),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TrashController.prototype, "permanentDeleteTask", null);
exports.TrashController = TrashController = __decorate([
    (0, swagger_1.ApiTags)('trash'),
    (0, common_1.Controller)('trash'),
    __metadata("design:paramtypes", [trash_service_1.TrashService])
], TrashController);
//# sourceMappingURL=trash.controller.js.map