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
exports.TaskService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_entity_1 = require("../../entities/task.entity");
const nestjs_cls_1 = require("nestjs-cls");
let TaskService = class TaskService {
    taskRepo;
    cls;
    constructor(taskRepo, cls) {
        this.taskRepo = taskRepo;
        this.cls = cls;
    }
    async create(dto) {
        const count = await this.taskRepo.count({ where: { taskListId: dto.taskListId } });
        const task = this.taskRepo.create({
            title: dto.title,
            description: dto.description,
            taskListId: dto.taskListId,
            assigneeId: dto.assigneeId,
            status: dto.status,
            startAt: dto.startAt ? new Date(dto.startAt) : null,
            dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
            parentId: dto.parentId || null,
            order: count
        });
        return await this.taskRepo.save(task);
    }
    async listByTaskList(taskListId, filters) {
        const queryBuilder = this.taskRepo.createQueryBuilder('task')
            .where('task.taskListId = :taskListId', { taskListId })
            .andWhere('task.parentId IS NULL');
        if (filters?.search) {
            queryBuilder.andWhere('(task.title ILIKE :search OR task.description ILIKE :search)', { search: `%${filters.search}%` });
        }
        if (filters?.startDate) {
            queryBuilder.andWhere('task.startAt >= :startDate', { startDate: filters.startDate });
        }
        if (filters?.endDate) {
            queryBuilder.andWhere('task.startAt <= :endDate', { endDate: filters.endDate });
        }
        const tasks = await queryBuilder
            .orderBy('task.order', 'ASC')
            .addOrderBy('task.createdAt', 'DESC')
            .getMany();
        return await this.loadChildren(tasks);
    }
    async loadChildren(tasks) {
        for (const task of tasks) {
            const children = await this.taskRepo.find({
                where: { parentId: task.id },
                order: { order: 'ASC', createdAt: 'DESC' }
            });
            if (children.length > 0) {
                task.children = await this.loadChildren(children);
            }
        }
        return tasks;
    }
    async update(id, dto) {
        const task = await this.taskRepo.findOne({ where: { id } });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        if (dto.startAt !== undefined)
            task.startAt = dto.startAt ? new Date(dto.startAt) : null;
        if (dto.dueAt !== undefined)
            task.dueAt = dto.dueAt ? new Date(dto.dueAt) : null;
        if (dto.title !== undefined)
            task.title = dto.title;
        if (dto.description !== undefined)
            task.description = dto.description;
        if (dto.assigneeId !== undefined)
            task.assigneeId = dto.assigneeId;
        if (dto.status !== undefined)
            task.status = dto.status;
        if (dto.taskListId !== undefined && dto.taskListId !== task.taskListId) {
            await this.taskRepo
                .createQueryBuilder()
                .update(task_entity_1.TaskEntity)
                .set({ order: () => "\"order\" - 1" })
                .where('"taskListId" = :listId AND "order" > :oldOrder', { listId: task.taskListId, oldOrder: task.order })
                .execute();
            const newIndex = await this.taskRepo.count({ where: { taskListId: dto.taskListId } });
            task.taskListId = dto.taskListId;
            task.order = newIndex;
            return await this.taskRepo.save(task);
        }
        return await this.taskRepo.save(task);
    }
    async reorder(params) {
        const task = await this.taskRepo.findOne({ where: { id: params.taskId } });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        const currentListId = task.taskListId;
        const currentOrder = task.order;
        const total = await this.taskRepo.count({ where: { taskListId: currentListId } });
        let targetIndex = Number.isFinite(params.targetIndex) ? Number(params.targetIndex) : currentOrder;
        targetIndex = Math.max(0, Math.min(total - 1, Math.floor(targetIndex)));
        if (targetIndex === currentOrder)
            return task;
        if (targetIndex < currentOrder) {
            await this.taskRepo
                .createQueryBuilder()
                .update(task_entity_1.TaskEntity)
                .set({ order: () => "\"order\" + 1" })
                .where('"taskListId" = :listId AND "order" >= :start AND "order" < :end', { listId: currentListId, start: targetIndex, end: currentOrder })
                .execute();
        }
        else {
            await this.taskRepo
                .createQueryBuilder()
                .update(task_entity_1.TaskEntity)
                .set({ order: () => "\"order\" - 1" })
                .where('"taskListId" = :listId AND "order" <= :end AND "order" > :start', { listId: currentListId, start: currentOrder, end: targetIndex })
                .execute();
        }
        task.order = targetIndex;
        return await this.taskRepo.save(task);
    }
    async deleteTask(id) {
        const task = await this.taskRepo.findOne({
            where: { id },
            relations: ['taskList', 'taskList.folder']
        });
        if (!task)
            throw new common_1.NotFoundException('Tapşırıq tapılmadı!');
        const user = this.cls.get('user');
        if (user.role !== 'admin' && task.taskList?.folder?.ownerId !== user.id) {
            throw new common_1.UnauthorizedException('Tapşırığı silmək üçün icazəniz yoxdur!');
        }
        await this.taskRepo.delete({ id });
        return { message: "Tapşırıq uğurla silindi!" };
    }
};
exports.TaskService = TaskService;
exports.TaskService = TaskService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_entity_1.TaskEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        nestjs_cls_1.ClsService])
], TaskService);
//# sourceMappingURL=task.service.js.map