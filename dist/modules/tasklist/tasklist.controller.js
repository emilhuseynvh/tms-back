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
exports.TaskListController = void 0;
const common_1 = require("@nestjs/common");
const tasklist_service_1 = require("./tasklist.service");
const create_tasklist_dto_1 = require("./dto/create-tasklist.dto");
const update_tasklist_dto_1 = require("./dto/update-tasklist.dto");
const filter_tasklist_dto_1 = require("./dto/filter-tasklist.dto");
const swagger_1 = require("@nestjs/swagger");
const auth_decorator_1 = require("../../shared/decorators/auth.decorator");
let TaskListController = class TaskListController {
    taskListService;
    constructor(taskListService) {
        this.taskListService = taskListService;
    }
    async listByFolder(folderId, filters) {
        return await this.taskListService.listByFolder(Number(folderId), filters);
    }
    async listBySpace(spaceId) {
        return await this.taskListService.listBySpace(Number(spaceId));
    }
    async create(body) {
        return await this.taskListService.create(body);
    }
    async updateTaskList(id, body) {
        return await this.taskListService.updateTaskList(id, body);
    }
    async deleteTaskList(id) {
        return await this.taskListService.deleteTaskList(id);
    }
};
exports.TaskListController = TaskListController;
__decorate([
    (0, common_1.Get)('folder/:folderId'),
    __param(0, (0, common_1.Param)('folderId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, filter_tasklist_dto_1.FilterTaskListDto]),
    __metadata("design:returntype", Promise)
], TaskListController.prototype, "listByFolder", null);
__decorate([
    (0, common_1.Get)('space/:spaceId'),
    __param(0, (0, common_1.Param)('spaceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TaskListController.prototype, "listBySpace", null);
__decorate([
    (0, common_1.Post)(),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tasklist_dto_1.CreateTaskListDto]),
    __metadata("design:returntype", Promise)
], TaskListController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id'),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_tasklist_dto_1.UpdateTaskListDto]),
    __metadata("design:returntype", Promise)
], TaskListController.prototype, "updateTaskList", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TaskListController.prototype, "deleteTaskList", null);
exports.TaskListController = TaskListController = __decorate([
    (0, swagger_1.ApiTags)('task-list'),
    (0, common_1.Controller)('task-list'),
    __metadata("design:paramtypes", [tasklist_service_1.TaskListService])
], TaskListController);
//# sourceMappingURL=tasklist.controller.js.map