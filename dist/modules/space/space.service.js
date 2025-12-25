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
exports.SpaceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const space_entity_1 = require("../../entities/space.entity");
const nestjs_cls_1 = require("nestjs-cls");
const activity_log_service_1 = require("../activity-log/activity-log.service");
const activity_log_entity_1 = require("../../entities/activity-log.entity");
let SpaceService = class SpaceService {
    spaceRepo;
    cls;
    activityLogService;
    constructor(spaceRepo, cls, activityLogService) {
        this.spaceRepo = spaceRepo;
        this.cls = cls;
        this.activityLogService = activityLogService;
    }
    async create(ownerId, dto) {
        const space = this.spaceRepo.create({ ...dto, ownerId });
        const savedSpace = await this.spaceRepo.save(space);
        await this.activityLogService.log(activity_log_entity_1.ActivityType.SPACE_CREATE, savedSpace.id, savedSpace.name, `"${savedSpace.name}" sahəsi yaradıldı`);
        return savedSpace;
    }
    async listAll() {
        return await this.spaceRepo.find({
            order: { createdAt: 'DESC' },
            relations: ['folders', 'taskLists']
        });
    }
    async listByOwner(ownerId) {
        return await this.spaceRepo.find({
            where: { ownerId },
            order: { createdAt: 'DESC' },
            relations: ['folders', 'folders.taskLists', 'taskLists']
        });
    }
    async getOne(id) {
        const space = await this.spaceRepo.findOne({
            where: { id },
            relations: ['folders', 'folders.taskLists', 'taskLists']
        });
        if (!space)
            throw new common_1.NotFoundException('Sahə tapılmadı!');
        return space;
    }
    async updateSpace(id, userId, dto) {
        const space = await this.spaceRepo.findOne({ where: { id } });
        if (!space)
            throw new common_1.NotFoundException('Sahə tapılmadı!');
        const user = this.cls.get('user');
        if (user.role !== 'admin' && space.ownerId !== userId) {
            throw new common_1.UnauthorizedException('Sahəni yeniləmək üçün icazəniz yoxdur!');
        }
        const oldName = space.name;
        Object.assign(space, dto);
        await this.spaceRepo.save(space);
        await this.activityLogService.log(activity_log_entity_1.ActivityType.SPACE_UPDATE, id, space.name, `"${oldName}" sahəsi yeniləndi`, { ...dto });
        return { message: "Sahə uğurla yeniləndi" };
    }
    async deleteSpace(id, userId) {
        const space = await this.spaceRepo.findOne({ where: { id } });
        if (!space)
            throw new common_1.NotFoundException('Sahə tapılmadı!');
        const user = this.cls.get('user');
        if (user.role !== 'admin' && space.ownerId !== userId) {
            throw new common_1.UnauthorizedException('Sahəni silmək üçün icazəniz yoxdur!');
        }
        await this.spaceRepo.softDelete({ id });
        await this.activityLogService.log(activity_log_entity_1.ActivityType.SPACE_DELETE, id, space.name, `"${space.name}" sahəsi silindi`);
        return { message: "Sahə uğurla silindi" };
    }
};
exports.SpaceService = SpaceService;
exports.SpaceService = SpaceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(space_entity_1.SpaceEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        nestjs_cls_1.ClsService,
        activity_log_service_1.ActivityLogService])
], SpaceService);
//# sourceMappingURL=space.service.js.map