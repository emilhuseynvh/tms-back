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
exports.TaskController = void 0;
const common_1 = require("@nestjs/common");
const task_service_1 = require("./task.service");
const create_task_dto_1 = require("./dto/create-task.dto");
const auth_decorator_1 = require("../../shared/decorators/auth.decorator");
const update_task_dto_1 = require("./dto/update-task.dto");
const reorder_task_dto_1 = require("./dto/reorder-task.dto");
const filter_task_dto_1 = require("./dto/filter-task.dto");
let TaskController = class TaskController {
    taskService;
    constructor(taskService) {
        this.taskService = taskService;
    }
    async listByTaskList(taskListId, filters) {
        return await this.taskService.listByTaskList(Number(taskListId), filters);
    }
    async create(body) {
        return await this.taskService.create(body);
    }
    async reorder(body) {
        return await this.taskService.reorder(body);
    }
    async update(id, body) {
        return await this.taskService.update(id, body);
    }
    async deleteTask(id) {
        return await this.taskService.deleteTask(id);
    }
};
exports.TaskController = TaskController;
__decorate([
    (0, common_1.Get)('list/:taskListId'),
    __param(0, (0, common_1.Param)('taskListId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, filter_task_dto_1.FilterTaskDto]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "listByTaskList", null);
__decorate([
    (0, common_1.Post)(),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_task_dto_1.CreateTaskDto]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('reorder'),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reorder_task_dto_1.ReorderTaskDto]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "reorder", null);
__decorate([
    (0, common_1.Post)(':id'),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_task_dto_1.UpdateTaskDto]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "deleteTask", null);
exports.TaskController = TaskController = __decorate([
    (0, common_1.Controller)('task'),
    __metadata("design:paramtypes", [task_service_1.TaskService])
], TaskController);
//# sourceMappingURL=task.controller.js.map