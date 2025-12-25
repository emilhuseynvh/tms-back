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
exports.TaskStatusService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_status_entity_1 = require("../../entities/task-status.entity");
let TaskStatusService = class TaskStatusService {
    taskStatusRepo;
    constructor(taskStatusRepo) {
        this.taskStatusRepo = taskStatusRepo;
    }
    async list() {
        return await this.taskStatusRepo.find({ order: { createdAt: 'DESC' } });
    }
    async getById(id) {
        const status = await this.taskStatusRepo.findOne({ where: { id } });
        if (!status)
            throw new common_1.NotFoundException('Tapşırıq statusu tapılmadı!');
        return status;
    }
    async create(dto) {
        const status = this.taskStatusRepo.create(dto);
        return await this.taskStatusRepo.save(status);
    }
    async update(id, dto) {
        const status = await this.getById(id);
        Object.assign(status, dto);
        return await this.taskStatusRepo.save(status);
    }
    async delete(id) {
        await this.getById(id);
        await this.taskStatusRepo.delete({ id });
        return { message: "Tapşırıq statusu uğurla silindi!" };
    }
};
exports.TaskStatusService = TaskStatusService;
exports.TaskStatusService = TaskStatusService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_status_entity_1.TaskStatusEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TaskStatusService);
//# sourceMappingURL=task-status.service.js.map