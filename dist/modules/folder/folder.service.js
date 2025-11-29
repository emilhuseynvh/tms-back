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
exports.FolderService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const folder_entity_1 = require("../../entities/folder.entity");
const nestjs_cls_1 = require("nestjs-cls");
let FolderService = class FolderService {
    folderRepo;
    cls;
    constructor(folderRepo, cls) {
        this.folderRepo = folderRepo;
        this.cls = cls;
    }
    async create(ownerId, dto) {
        const folder = this.folderRepo.create({ ...dto, ownerId });
        return await this.folderRepo.save(folder);
    }
    async listAll() {
        return await this.folderRepo.find({ order: { createdAt: 'DESC' } });
    }
    async listByOwner(ownerId) {
        return await this.folderRepo.find({ where: { ownerId }, order: { createdAt: 'DESC' } });
    }
    async updateFolder(id, userId, dto) {
        const folder = await this.folderRepo.findOne({ where: { id } });
        if (!folder)
            throw new common_1.NotFoundException('Qovluq tapılmadı!');
        const user = this.cls.get('user');
        if (user.role !== 'admin' && folder.ownerId !== userId) {
            throw new common_1.UnauthorizedException('Qovluğu yeniləmək üçün icazəniz yoxdur!');
        }
        Object.assign(folder, dto);
        await this.folderRepo.save(folder);
        return { message: "Qovluq uğurla yeniləndi" };
    }
    async deleteFolder(id, userId) {
        const folder = await this.folderRepo.findOne({ where: { id } });
        if (!folder)
            throw new common_1.NotFoundException('Qovluq tapılmadı!');
        const user = this.cls.get('user');
        if (user.role !== 'admin' && folder.ownerId !== userId) {
            throw new common_1.UnauthorizedException('Qovluğu silmək üçün icazəniz yoxdur!');
        }
        await this.folderRepo.delete({ id });
        return { message: "Qovluq uğurla silindi" };
    }
};
exports.FolderService = FolderService;
exports.FolderService = FolderService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(folder_entity_1.FolderEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof nestjs_cls_1.ClsService !== "undefined" && nestjs_cls_1.ClsService) === "function" ? _b : Object])
], FolderService);
//# sourceMappingURL=folder.service.js.map