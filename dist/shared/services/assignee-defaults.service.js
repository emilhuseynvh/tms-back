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
exports.AssigneeDefaultsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../entities/user.entity");
const role_enum_1 = require("../enums/role.enum");
let AssigneeDefaultsService = class AssigneeDefaultsService {
    userRepo;
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async getAdminUserIds() {
        const admins = await this.userRepo.find({
            where: { role: role_enum_1.RoleEnum.ADMIN },
            select: { id: true },
            order: { id: 'ASC' },
        });
        return admins.map((u) => u.id);
    }
    async mergeResourceAssignees(dtoAssigneeIds, creatorId) {
        const adminIds = await this.getAdminUserIds();
        const merged = new Set();
        for (const id of adminIds)
            merged.add(id);
        if (creatorId)
            merged.add(creatorId);
        for (const id of dtoAssigneeIds || [])
            merged.add(id);
        return [...merged];
    }
    resolveTaskAssigneeIds(dtoAssigneeIds, creatorId) {
        if (dtoAssigneeIds?.length)
            return dtoAssigneeIds;
        return creatorId ? [creatorId] : [];
    }
};
exports.AssigneeDefaultsService = AssigneeDefaultsService;
exports.AssigneeDefaultsService = AssigneeDefaultsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AssigneeDefaultsService);
//# sourceMappingURL=assignee-defaults.service.js.map