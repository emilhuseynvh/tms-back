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
exports.TaskStatusController = void 0;
const common_1 = require("@nestjs/common");
const task_status_service_1 = require("./task-status.service");
const create_task_status_dto_1 = require("./dto/create-task-status.dto");
const update_task_status_dto_1 = require("./dto/update-task-status.dto");
const auth_decorator_1 = require("../../shared/decorators/auth.decorator");
let TaskStatusController = class TaskStatusController {
    taskStatusService;
    constructor(taskStatusService) {
        this.taskStatusService = taskStatusService;
    }
    async list() {
        return await this.taskStatusService.list();
    }
    async getById(id) {
        return await this.taskStatusService.getById(id);
    }
    async create(body) {
        return await this.taskStatusService.create(body);
    }
    async update(id, body) {
        return await this.taskStatusService.update(id, body);
    }
    async delete(id) {
        return await this.taskStatusService.delete(id);
    }
};
exports.TaskStatusController = TaskStatusController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TaskStatusController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TaskStatusController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)(),
    (0, auth_decorator_1.Auth)('admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_task_status_dto_1.CreateTaskStatusDto]),
    __metadata("design:returntype", Promise)
], TaskStatusController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id'),
    (0, auth_decorator_1.Auth)('admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_task_status_dto_1.UpdateTaskStatusDto]),
    __metadata("design:returntype", Promise)
], TaskStatusController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, auth_decorator_1.Auth)('admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TaskStatusController.prototype, "delete", null);
exports.TaskStatusController = TaskStatusController = __decorate([
    (0, common_1.Controller)('task-status'),
    __metadata("design:paramtypes", [task_status_service_1.TaskStatusService])
], TaskStatusController);
//# sourceMappingURL=task-status.controller.js.map