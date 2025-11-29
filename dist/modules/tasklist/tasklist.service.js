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
exports.TaskListService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tasklist_entity_1 = require("../../entities/tasklist.entity");
const nestjs_cls_1 = require("nestjs-cls");
let TaskListService = class TaskListService {
    taskListRepo;
    cls;
    constructor(taskListRepo, cls) {
        this.taskListRepo = taskListRepo;
        this.cls = cls;
    }
    async create(dto) {
        const list = this.taskListRepo.create(dto);
        return await this.taskListRepo.save(list);
    }
    async listByFolder(folderId, filters) {
        const queryBuilder = this.taskListRepo.createQueryBuilder('taskList')
            .leftJoinAndSelect('taskList.tasks', 'task')
            .where('taskList.folderId = :folderId', { folderId });
        if (filters?.search) {
            queryBuilder.andWhere('(taskList.name ILIKE :search OR task.title ILIKE :search OR task.description ILIKE :search)', { search: `%${filters.search}%` });
        }
        if (filters?.startDate) {
            queryBuilder.andWhere('task.startAt >= :startDate', { startDate: filters.startDate });
        }
        if (filters?.endDate) {
            queryBuilder.andWhere('task.startAt <= :endDate', { endDate: filters.endDate });
        }
        return await queryBuilder
            .orderBy('taskList.createdAt', 'DESC')
            .addOrderBy('task.order', 'ASC')
            .getMany();
    }
    async updateTaskList(id, dto) {
        const taskList = await this.taskListRepo.findOne({
            where: { id },
            relations: ['folder']
        });
        if (!taskList)
            throw new common_1.NotFoundException('Siyahı tapılmadı');
        const user = this.cls.get('user');
        if (user.role !== 'admin' && taskList.folder.ownerId !== user.id) {
            throw new common_1.UnauthorizedException('Siyahını yeniləmək üçün icazəniz yoxdur');
        }
        Object.assign(taskList, dto);
        await this.taskListRepo.save(taskList);
        return { message: "Siyahı uğurla yeniləndi" };
    }
    async deleteTaskList(id) {
        const taskList = await this.taskListRepo.findOne({
            where: { id },
            relations: ['folder']
        });
        if (!taskList)
            throw new common_1.NotFoundException('Siyahı tapılmadı');
        const user = this.cls.get('user');
        if (user.role !== 'admin' && taskList.folder.ownerId !== user.id) {
            throw new common_1.UnauthorizedException('Siyahını silmək üçün icazəniz yoxdur');
        }
        await this.taskListRepo.delete({ id });
        return { message: "Siyahı uğurla silindi" };
    }
};
exports.TaskListService = TaskListService;
exports.TaskListService = TaskListService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tasklist_entity_1.TaskListEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof nestjs_cls_1.ClsService !== "undefined" && nestjs_cls_1.ClsService) === "function" ? _b : Object])
], TaskListService);
//# sourceMappingURL=tasklist.service.js.map