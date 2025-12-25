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
exports.SpaceController = void 0;
const common_1 = require("@nestjs/common");
const space_service_1 = require("./space.service");
const create_space_dto_1 = require("./dto/create-space.dto");
const update_space_dto_1 = require("./dto/update-space.dto");
const swagger_1 = require("@nestjs/swagger");
const auth_decorator_1 = require("../../shared/decorators/auth.decorator");
const nestjs_cls_1 = require("nestjs-cls");
let SpaceController = class SpaceController {
    spaceService;
    cls;
    constructor(spaceService, cls) {
        this.spaceService = spaceService;
        this.cls = cls;
    }
    async listAll() {
        return await this.spaceService.listAll();
    }
    async mySpaces() {
        const user = this.cls.get('user');
        return await this.spaceService.listByOwner(user.id);
    }
    async getOne(id) {
        return await this.spaceService.getOne(id);
    }
    async create(body) {
        const user = this.cls.get('user');
        return await this.spaceService.create(user.id, body);
    }
    async updateSpace(id, body) {
        const user = this.cls.get('user');
        return await this.spaceService.updateSpace(id, user.id, body);
    }
    async deleteSpace(id) {
        const user = this.cls.get('user');
        return await this.spaceService.deleteSpace(id, user.id);
    }
};
exports.SpaceController = SpaceController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SpaceController.prototype, "listAll", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, auth_decorator_1.Auth)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SpaceController.prototype, "mySpaces", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SpaceController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_space_dto_1.CreateSpaceDto]),
    __metadata("design:returntype", Promise)
], SpaceController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id'),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_space_dto_1.UpdateSpaceDto]),
    __metadata("design:returntype", Promise)
], SpaceController.prototype, "updateSpace", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SpaceController.prototype, "deleteSpace", null);
exports.SpaceController = SpaceController = __decorate([
    (0, swagger_1.ApiTags)('space'),
    (0, common_1.Controller)('space'),
    __metadata("design:paramtypes", [space_service_1.SpaceService,
        nestjs_cls_1.ClsService])
], SpaceController);
//# sourceMappingURL=space.controller.js.map