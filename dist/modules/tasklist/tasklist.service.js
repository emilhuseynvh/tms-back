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
exports.TaskListService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tasklist_entity_1 = require("../../entities/tasklist.entity");
const nestjs_cls_1 = require("nestjs-cls");
const activity_log_service_1 = require("../activity-log/activity-log.service");
const activity_log_entity_1 = require("../../entities/activity-log.entity");
const notification_service_1 = require("../notification/notification.service");
const notification_entity_1 = require("../../entities/notification.entity");
const assignee_defaults_service_1 = require("../../shared/services/assignee-defaults.service");
const filter_date_utils_1 = require("../../shared/utils/filter-date.utils");
let TaskListService = class TaskListService {
    taskListRepo;
    assigneeDefaults;
    cls;
    activityLogService;
    notificationService;
    constructor(taskListRepo, assigneeDefaults, cls, activityLogService, notificationService) {
        this.taskListRepo = taskListRepo;
        this.assigneeDefaults = assigneeDefaults;
        this.cls = cls;
        this.activityLogService = activityLogService;
        this.notificationService = notificationService;
    }
    async create(dto) {
        if (!dto.folderId && !dto.spaceId) {
            throw new common_1.BadRequestException('folderId və ya spaceId lazımdır');
        }
        const user = this.cls.get('user');
        const assigneeIds = await this.assigneeDefaults.mergeResourceAssignees(dto.assigneeIds, user?.id);
        const list = new tasklist_entity_1.TaskListEntity();
        list.name = dto.name;
        list.type = dto.type || 'list';
        list.content = dto.content || null;
        list.folderId = dto.folderId || null;
        list.spaceId = dto.spaceId || null;
        list.assignees = assigneeIds.map((id) => ({ id }));
        const savedList = await this.taskListRepo.save(list);
        for (const userId of assigneeIds) {
            if (userId !== user?.id) {
                await this.notificationService.createNotification({
                    userId,
                    type: notification_entity_1.NotificationType.LIST_ASSIGNED,
                    title: 'Siyahıya əlavə edildiniz',
                    message: `"${savedList.name}" siyahısına əlavə edildiniz`,
                    listId: savedList.id
                });
            }
        }
        await this.activityLogService.log(activity_log_entity_1.ActivityType.LIST_CREATE, savedList.id, savedList.name, `"${savedList.name}" siyahısı yaradıldı`, assigneeIds.length ? { assignees: assigneeIds } : undefined);
        return savedList;
    }
    async listBySpace(spaceId) {
        return await this.taskListRepo.find({
            where: { spaceId, folderId: (0, typeorm_2.IsNull)() },
            order: { order: 'ASC' },
            relations: ['tasks']
        });
    }
    async getOne(id) {
        const taskList = await this.taskListRepo.findOne({
            where: { id },
            relations: ['folder', 'folder.space', 'space']
        });
        if (!taskList)
            throw new common_1.NotFoundException('Siyahı tapılmadı');
        return taskList;
    }
    async listByFolder(folderId, filters) {
        const queryBuilder = this.taskListRepo.createQueryBuilder('taskList')
            .leftJoinAndSelect('taskList.tasks', 'task')
            .where('taskList.folderId = :folderId', { folderId });
        if (filters?.search) {
            queryBuilder.andWhere('(taskList.name LIKE :search OR task.title LIKE :search OR task.description LIKE :search)', { search: `%${filters.search}%` });
        }
        const { start: rangeStart, end: rangeEnd } = (0, filter_date_utils_1.resolveFilterDateRange)(filters?.startDate, filters?.endDate);
        if (rangeStart) {
            queryBuilder.andWhere('task.startAt >= :filterStartAt', { filterStartAt: rangeStart });
        }
        if (rangeEnd) {
            queryBuilder.andWhere('task.dueAt <= :filterDueAt', { filterDueAt: rangeEnd });
        }
        return await queryBuilder
            .orderBy('taskList.order', 'ASC')
            .addOrderBy('task.order', 'ASC')
            .getMany();
    }
    async updateTaskList(id, dto) {
        const taskList = await this.taskListRepo.findOne({
            where: { id },
            relations: ['folder', 'space', 'assignees']
        });
        if (!taskList)
            throw new common_1.NotFoundException('Siyahı tapılmadı');
        const oldName = taskList.name;
        const changes = {};
        if (dto.assigneeIds !== undefined) {
            const oldAssigneeIds = taskList.assignees?.map(u => u.id) || [];
            const newAssigneeIds = dto.assigneeIds || [];
            const addedUserIds = newAssigneeIds.filter(id => !oldAssigneeIds.includes(id));
            const removedUserIds = oldAssigneeIds.filter(id => !newAssigneeIds.includes(id));
            for (const assigneeId of addedUserIds) {
                await this.notificationService.createNotification({
                    userId: assigneeId,
                    type: notification_entity_1.NotificationType.LIST_ASSIGNED,
                    title: 'Siyahıya əlavə edildiniz',
                    message: `"${taskList.name}" siyahısına əlavə edildiniz`,
                    listId: taskList.id
                });
            }
            for (const assigneeId of removedUserIds) {
                await this.notificationService.createNotification({
                    userId: assigneeId,
                    type: notification_entity_1.NotificationType.LIST_UNASSIGNED,
                    title: 'Siyahıdan çıxarıldınız',
                    message: `"${taskList.name}" siyahısından çıxarıldınız`,
                    listId: taskList.id
                });
            }
            if (addedUserIds.length || removedUserIds.length) {
                changes.assignees = { added: addedUserIds, removed: removedUserIds };
            }
            taskList.assignees = newAssigneeIds.map(id => ({ id }));
        }
        if (dto.name)
            changes.name = { old: oldName, new: dto.name };
        if (dto.name !== undefined)
            taskList.name = dto.name;
        if (dto.content !== undefined)
            taskList.content = dto.content;
        await this.taskListRepo.save(taskList);
        await this.activityLogService.log(activity_log_entity_1.ActivityType.LIST_UPDATE, id, taskList.name, `"${oldName}" siyahısı yeniləndi`, changes);
        return { message: "Siyahı uğurla yeniləndi" };
    }
    async deleteTaskList(id) {
        const taskList = await this.taskListRepo.findOne({
            where: { id },
            relations: ['folder', 'space']
        });
        if (!taskList)
            throw new common_1.NotFoundException('Siyahı tapılmadı');
        const user = this.cls.get('user');
        const ownerId = taskList.folder?.ownerId || taskList.space?.ownerId;
        if (user.role !== 'admin' && ownerId !== user.id) {
            throw new common_1.UnauthorizedException('Siyahını silmək üçün icazəniz yoxdur');
        }
        taskList.deletedById = user.id;
        await this.taskListRepo.save(taskList);
        await this.taskListRepo.softDelete({ id });
        await this.activityLogService.log(activity_log_entity_1.ActivityType.LIST_DELETE, id, taskList.name, `"${taskList.name}" siyahısı silindi`);
        return { message: "Siyahı uğurla silindi" };
    }
    async reorderTaskLists(listIds) {
        for (let i = 0; i < listIds.length; i++) {
            await this.taskListRepo.update(listIds[i], { order: i });
        }
        return { message: "Sıralama yeniləndi" };
    }
    async moveTaskList(id, targetFolderId, targetSpaceId) {
        const taskList = await this.taskListRepo.findOne({ where: { id } });
        if (!taskList)
            throw new common_1.NotFoundException('Siyahı tapılmadı!');
        const oldFolderId = taskList.folderId;
        const oldSpaceId = taskList.spaceId;
        taskList.folderId = targetFolderId;
        taskList.spaceId = targetSpaceId;
        await this.taskListRepo.save(taskList);
        await this.activityLogService.log(activity_log_entity_1.ActivityType.LIST_UPDATE, id, taskList.name, `"${taskList.name}" siyahısı köçürüldü`, { oldFolderId, oldSpaceId, newFolderId: targetFolderId, newSpaceId: targetSpaceId });
        return { message: "Siyahı köçürüldü" };
    }
};
exports.TaskListService = TaskListService;
exports.TaskListService = TaskListService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tasklist_entity_1.TaskListEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        assignee_defaults_service_1.AssigneeDefaultsService,
        nestjs_cls_1.ClsService,
        activity_log_service_1.ActivityLogService,
        notification_service_1.NotificationService])
], TaskListService);
//# sourceMappingURL=tasklist.service.js.map