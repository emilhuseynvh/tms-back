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
const tasklist_entity_1 = require("../../entities/tasklist.entity");
const task_status_entity_1 = require("../../entities/task-status.entity");
const task_activity_entity_1 = require("../../entities/task-activity.entity");
const nestjs_cls_1 = require("nestjs-cls");
const assignee_defaults_service_1 = require("../../shared/services/assignee-defaults.service");
const activity_log_service_1 = require("../activity-log/activity-log.service");
const activity_log_entity_1 = require("../../entities/activity-log.entity");
const notification_service_1 = require("../notification/notification.service");
const notification_gateway_1 = require("../notification/notification.gateway");
const filter_date_utils_1 = require("../../shared/utils/filter-date.utils");
let TaskService = class TaskService {
    taskRepo;
    taskListRepo;
    taskStatusRepo;
    taskActivityRepo;
    assigneeDefaults;
    cls;
    activityLogService;
    notificationService;
    notificationGateway;
    async onModuleInit() {
        try {
            const orphans = await this.taskRepo.find({
                where: { createdById: (0, typeorm_2.IsNull)() },
                select: ['id'],
                withDeleted: true,
            });
            for (const t of orphans) {
                const firstActivity = await this.taskActivityRepo.findOne({
                    where: { taskId: t.id },
                    order: { createdAt: 'ASC' },
                });
                if (firstActivity?.userId) {
                    await this.taskRepo.update({ id: t.id }, { createdById: firstActivity.userId });
                }
            }
            if (orphans.length > 0) {
                console.log(`Task createdById backfill: ${orphans.length} task yoxlanıldı`);
            }
        }
        catch (e) {
            console.error('Task createdById backfill xətası:', e?.message);
        }
    }
    constructor(taskRepo, taskListRepo, taskStatusRepo, taskActivityRepo, assigneeDefaults, cls, activityLogService, notificationService, notificationGateway) {
        this.taskRepo = taskRepo;
        this.taskListRepo = taskListRepo;
        this.taskStatusRepo = taskStatusRepo;
        this.taskActivityRepo = taskActivityRepo;
        this.assigneeDefaults = assigneeDefaults;
        this.cls = cls;
        this.activityLogService = activityLogService;
        this.notificationService = notificationService;
        this.notificationGateway = notificationGateway;
    }
    async create(dto) {
        if (dto.statusId !== undefined && dto.statusId !== null) {
            await this.ensureStatusExists(dto.statusId);
        }
        const creator = this.cls.get('user');
        const assigneeIds = this.assigneeDefaults.resolveTaskAssigneeIds(dto.assigneeIds, creator?.id);
        const count = await this.taskRepo.count({ where: { taskListId: dto.taskListId } });
        const task = this.taskRepo.create({
            title: dto.title,
            description: dto.description ?? '',
            createdById: creator?.id || null,
            taskListId: dto.taskListId,
            statusId: dto.statusId || null,
            startAt: dto.startAt ? new Date(dto.startAt) : new Date(),
            dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
            parentId: dto.parentId || null,
            order: count,
            link: dto.link ?? null,
            assignees: assigneeIds.map((id) => ({ id }))
        });
        const savedTask = await this.taskRepo.save(task);
        if (assigneeIds.length > 0) {
            for (const userId of assigneeIds) {
                await this.notificationService.createNotificationRecord(savedTask.id, userId);
                const notification = await this.notificationService.notifyTaskAssigned(savedTask.id, userId, savedTask.title);
                this.notificationGateway.emitNewNotification(userId, notification);
                const unreadCount = await this.notificationService.getUnreadCount(userId);
                this.notificationGateway.emitUnreadCountUpdate(userId, unreadCount);
            }
        }
        await this.activityLogService.log(activity_log_entity_1.ActivityType.TASK_CREATE, savedTask.id, savedTask.title, `"${savedTask.title}" tapşırığı yaradıldı`);
        await this.logTaskCreation(savedTask.id, savedTask.title);
        return savedTask;
    }
    async listByTaskList(taskListId, filters) {
        const user = this.cls.get('user');
        const isAdmin = user?.role === 'admin';
        const queryBuilder = this.taskRepo.createQueryBuilder('task')
            .leftJoinAndSelect('task.status', 'status')
            .leftJoinAndSelect('task.assignees', 'assignees')
            .where('task.taskListId = :taskListId', { taskListId })
            .andWhere('task.parentId IS NULL')
            .andWhere('(task.isArchived IS NULL OR task.isArchived = false)');
        if (!isAdmin && user?.id) {
            queryBuilder.andWhere(qb => {
                const subQuery = qb.subQuery()
                    .select('1')
                    .from('task_assignees', 'ta')
                    .where('ta.taskId = task.id')
                    .andWhere('ta.userId = :userId')
                    .getQuery();
                return `EXISTS ${subQuery}`;
            });
            queryBuilder.setParameter('userId', user.id);
        }
        if (filters?.search) {
            queryBuilder.andWhere('(task.title LIKE :search OR task.description LIKE :search)', { search: `%${filters.search}%` });
        }
        const { start: rangeStart, end: rangeEnd } = (0, filter_date_utils_1.resolveFilterDateRange)(filters?.startDate, filters?.endDate);
        if (rangeStart) {
            queryBuilder.andWhere('task.startAt >= :filterStartAt', { filterStartAt: rangeStart });
        }
        if (rangeEnd) {
            queryBuilder.andWhere('task.dueAt <= :filterDueAt', { filterDueAt: rangeEnd });
        }
        if (filters?.statusId) {
            queryBuilder.andWhere('task.statusId = :statusId', { statusId: parseInt(filters.statusId) });
        }
        if (filters?.assigneeId) {
            queryBuilder.andWhere(qb => {
                const subQuery = qb.subQuery()
                    .select('1')
                    .from('task_assignees', 'ta_filter')
                    .where('ta_filter.taskId = task.id')
                    .andWhere('ta_filter.userId = :filterAssigneeId')
                    .getQuery();
                return `EXISTS ${subQuery}`;
            });
            queryBuilder.setParameter('filterAssigneeId', parseInt(filters.assigneeId));
        }
        const tasks = await queryBuilder
            .orderBy('task.order', 'ASC')
            .addOrderBy('task.createdAt', 'DESC')
            .getMany();
        return await this.loadChildren(tasks, isAdmin, user?.id, filters);
    }
    async loadChildren(tasks, isAdmin = true, userId, filters) {
        for (const task of tasks) {
            let childQuery = this.taskRepo.createQueryBuilder('task')
                .leftJoinAndSelect('task.assignees', 'assignees')
                .leftJoinAndSelect('task.status', 'status')
                .where('task.parentId = :parentId', { parentId: task.id })
                .andWhere('(task.isArchived IS NULL OR task.isArchived = false)');
            if (!isAdmin && userId) {
                childQuery.andWhere(qb => {
                    const subQuery = qb.subQuery()
                        .select('1')
                        .from('task_assignees', 'ta')
                        .where('ta.taskId = task.id')
                        .andWhere('ta.userId = :userId', { userId })
                        .getQuery();
                    return `EXISTS ${subQuery}`;
                });
            }
            if (filters?.statusId) {
                childQuery.andWhere('task.statusId = :childStatusId', { childStatusId: parseInt(filters.statusId) });
            }
            if (filters?.assigneeId) {
                childQuery.andWhere(qb => {
                    const subQuery = qb.subQuery()
                        .select('1')
                        .from('task_assignees', 'ta_child_filter')
                        .where('ta_child_filter.taskId = task.id')
                        .andWhere('ta_child_filter.userId = :childFilterAssigneeId')
                        .getQuery();
                    return `EXISTS ${subQuery}`;
                });
                childQuery.setParameter('childFilterAssigneeId', parseInt(filters.assigneeId));
            }
            const children = await childQuery
                .orderBy('task.order', 'ASC')
                .addOrderBy('task.createdAt', 'DESC')
                .getMany();
            if (children.length > 0) {
                task.children = await this.loadChildren(children, isAdmin, userId, filters);
            }
        }
        return tasks;
    }
    async update(id, dto) {
        const task = await this.taskRepo.findOne({ where: { id }, relations: ['assignees'] });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        if (dto.statusId !== undefined && dto.statusId !== null) {
            await this.ensureStatusExists(dto.statusId);
        }
        const changes = {};
        this.collectChanges(changes, 'title', task.title, dto.title);
        this.collectChanges(changes, 'description', task.description, dto.description);
        this.collectChanges(changes, 'startAt', task.startAt, dto.startAt ? new Date(dto.startAt) : dto.startAt === null ? null : undefined);
        this.collectChanges(changes, 'dueAt', task.dueAt, dto.dueAt ? new Date(dto.dueAt) : dto.dueAt === null ? null : undefined);
        this.collectChanges(changes, 'statusId', task.statusId, dto.statusId);
        this.collectChanges(changes, 'taskListId', task.taskListId, dto.taskListId);
        this.collectChanges(changes, 'link', task.link, dto.link);
        this.collectChanges(changes, 'doc', task.doc, dto.doc);
        this.collectChanges(changes, 'meetingNotes', task.meetingNotes, dto.meetingNotes);
        if (dto.assigneeIds !== undefined) {
            const prev = (task.assignees || []).map((a) => a.id).sort();
            const next = [...dto.assigneeIds].sort();
            if (prev.length !== next.length || prev.some((v, idx) => v !== next[idx])) {
                changes.assignees = { from: prev, to: next };
            }
        }
        if (dto.startAt !== undefined)
            task.startAt = dto.startAt ? new Date(dto.startAt) : null;
        if (dto.dueAt !== undefined)
            task.dueAt = dto.dueAt ? new Date(dto.dueAt) : null;
        if (dto.title !== undefined)
            task.title = dto.title;
        if (dto.description !== undefined)
            task.description = dto.description;
        if (dto.assigneeIds !== undefined) {
            const prevIds = (task.assignees || []).map((a) => a.id);
            const nextIds = dto.assigneeIds;
            const addedUserIds = nextIds.filter(id => !prevIds.includes(id));
            for (const userId of addedUserIds) {
                await this.notificationService.createNotificationRecord(id, userId);
                const notification = await this.notificationService.notifyTaskAssigned(id, userId, task.title);
                this.notificationGateway.emitNewNotification(userId, notification);
                const unreadCount = await this.notificationService.getUnreadCount(userId);
                this.notificationGateway.emitUnreadCountUpdate(userId, unreadCount);
            }
            const removedUserIds = prevIds.filter(id => !nextIds.includes(id));
            for (const userId of removedUserIds) {
                await this.notificationService.removeNotificationRecord(id, userId);
                const notification = await this.notificationService.notifyTaskUnassigned(id, userId, task.title);
                this.notificationGateway.emitNewNotification(userId, notification);
                const unreadCount = await this.notificationService.getUnreadCount(userId);
                this.notificationGateway.emitUnreadCountUpdate(userId, unreadCount);
            }
            task.assignees = dto.assigneeIds.map((id) => ({ id }));
            task.updatedAt = new Date();
        }
        if (dto.statusId !== undefined) {
            task.statusId = dto.statusId;
            delete task.status;
        }
        if (dto.link !== undefined)
            task.link = dto.link;
        if (dto.doc !== undefined)
            task.doc = dto.doc;
        if (dto.meetingNotes !== undefined)
            task.meetingNotes = dto.meetingNotes;
        if (dto.parentId !== undefined) {
            const oldParentName = task.parentId ? (await this.taskRepo.findOne({ where: { id: task.parentId } }))?.title : null;
            const newParentName = dto.parentId ? (await this.taskRepo.findOne({ where: { id: dto.parentId } }))?.title : null;
            if (task.parentId !== dto.parentId) {
                changes['parentId'] = {
                    from: oldParentName,
                    to: newParentName,
                    fromId: task.parentId,
                    toId: dto.parentId
                };
            }
            task.parentId = dto.parentId ?? null;
        }
        if (dto.taskListId !== undefined && dto.taskListId !== task.taskListId) {
            await this.moveTaskToListSafely(task, dto.taskListId, {
                detachFromParent: dto.parentId === null,
            });
            task.taskListId = dto.taskListId;
            await this.logTaskActivity(task.id, changes);
            await this.activityLogService.log(activity_log_entity_1.ActivityType.TASK_UPDATE, id, task.title, `"${task.title}" tapşırığı yeniləndi`, { ...changes });
            return await this.taskRepo.findOne({
                where: { id },
                relations: ['assignees', 'status']
            });
        }
        await this.taskRepo.save(task);
        const updatedTask = await this.taskRepo.findOne({
            where: { id },
            relations: ['assignees', 'status']
        });
        await this.logTaskActivity(task.id, changes);
        if (Object.keys(changes).length > 0) {
            await this.activityLogService.log(activity_log_entity_1.ActivityType.TASK_UPDATE, id, task.title, `"${task.title}" tapşırığı yeniləndi`, { ...changes });
        }
        return updatedTask;
    }
    async ensureStatusExists(statusId) {
        const exists = await this.taskStatusRepo.exist({ where: { id: statusId } });
        if (!exists)
            throw new common_1.NotFoundException('Task status not found');
    }
    collectChanges(acc, key, fromValue, toValue) {
        if (toValue === undefined)
            return;
        const normalizedFrom = fromValue instanceof Date ? fromValue.toISOString() : fromValue;
        const normalizedTo = toValue instanceof Date ? toValue.toISOString() : toValue;
        if (normalizedFrom !== normalizedTo) {
            acc[key] = { from: normalizedFrom ?? null, to: normalizedTo ?? null };
        }
    }
    async logTaskActivity(taskId, changes) {
        if (!changes || Object.keys(changes).length === 0)
            return;
        const user = this.cls.get('user') || {};
        const log = this.taskActivityRepo.create({
            taskId,
            userId: user.id ?? null,
            username: user.username ?? null,
            changes
        });
        await this.taskActivityRepo.save(log);
    }
    async ensureActiveTaskList(taskListId) {
        const list = await this.taskListRepo.findOne({
            where: { id: taskListId, isArchived: false },
        });
        if (!list) {
            throw new common_1.NotFoundException('Hədəf siyahı tapılmadı və ya arxivlənib');
        }
        return list;
    }
    async moveTaskToListSafely(task, targetListId, options = {}) {
        if (task.taskListId === targetListId)
            return;
        await this.ensureActiveTaskList(targetListId);
        await this.taskRepo.manager.transaction(async (manager) => {
            const taskRepo = manager.getRepository(task_entity_1.TaskEntity);
            await taskRepo.decrement({ taskListId: task.taskListId, order: (0, typeorm_2.MoreThan)(task.order) }, 'order', 1);
            const newIndex = await taskRepo.count({ where: { taskListId: targetListId } });
            const updateFields = {
                taskListId: targetListId,
                order: newIndex,
            };
            if (options.detachFromParent) {
                if (task.parentId !== null) {
                    updateFields.parentId = null;
                }
            }
            else if (task.parentId) {
                const parent = await taskRepo.findOne({ where: { id: task.parentId } });
                if (parent && parent.taskListId !== targetListId) {
                    throw new common_1.BadRequestException('Ana tapşırıq başqa siyahıdadır. Əvvəlcə ana tapşırığı köçürün və ya alt tapşırığı ayrı köçürmək üçün parentId: null göndərin.');
                }
            }
            await taskRepo.update({ id: task.id }, updateFields);
            await this.syncDescendantsTaskListIdInRepo(taskRepo, task.id, targetListId);
        });
    }
    async syncDescendantsTaskListIdInRepo(taskRepo, parentId, taskListId) {
        const children = await taskRepo.find({ where: { parentId } });
        for (const child of children) {
            if (child.taskListId !== taskListId) {
                await taskRepo.update({ id: child.id }, { taskListId });
            }
            await this.syncDescendantsTaskListIdInRepo(taskRepo, child.id, taskListId);
        }
    }
    async logTaskCreation(taskId, taskTitle) {
        const user = this.cls.get('user') || {};
        const log = this.taskActivityRepo.create({
            taskId,
            userId: user.id ?? null,
            username: user.username ?? null,
            changes: { created: { from: null, to: taskTitle ? `"${taskTitle}" tapşırığı yaradıldı` : 'Tapşırıq yaradıldı' } }
        });
        await this.taskActivityRepo.save(log);
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
            await this.taskRepo.increment({ taskListId: currentListId, order: (0, typeorm_2.Between)(targetIndex, currentOrder - 1) }, 'order', 1);
        }
        else {
            await this.taskRepo.decrement({ taskListId: currentListId, order: (0, typeorm_2.Between)(currentOrder + 1, targetIndex) }, 'order', 1);
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
        if (user?.role !== 'admin' && task.taskList?.folder?.ownerId !== user?.id) {
            throw new common_1.UnauthorizedException('Tapşırığı silmək üçün icazəniz yoxdur!');
        }
        task.deletedById = user.id;
        await this.taskRepo.save(task);
        await this.taskRepo.softDelete({ id });
        await this.activityLogService.log(activity_log_entity_1.ActivityType.TASK_DELETE, id, task.title, `"${task.title}" tapşırığı silindi`);
        return { message: "Tapşırıq uğurla silindi!" };
    }
    async getTaskActivities(taskId, limit = 10) {
        return await this.taskActivityRepo.find({
            where: { taskId },
            order: { createdAt: 'DESC' },
            take: limit
        });
    }
    async getMyTasks() {
        const user = this.cls.get('user');
        if (!user?.id)
            return [];
        const isAdmin = user.role === 'admin';
        const queryBuilder = this.taskRepo.createQueryBuilder('task')
            .leftJoinAndSelect('task.status', 'status')
            .leftJoinAndSelect('task.assignees', 'assignees')
            .where('task.isArchived = false')
            .andWhere('task.deletedAt IS NULL')
            .andWhere('task.dueAt IS NOT NULL');
        if (!isAdmin) {
            queryBuilder.andWhere(qb => {
                const subQuery = qb.subQuery()
                    .select('1')
                    .from('task_assignees', 'ta')
                    .where('ta.taskId = task.id')
                    .andWhere('ta.userId = :userId')
                    .getQuery();
                return `EXISTS ${subQuery}`;
            });
            queryBuilder.setParameter('userId', user.id);
        }
        return await queryBuilder
            .orderBy('task.dueAt', 'ASC')
            .getMany();
    }
};
exports.TaskService = TaskService;
exports.TaskService = TaskService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_entity_1.TaskEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(tasklist_entity_1.TaskListEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(task_status_entity_1.TaskStatusEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(task_activity_entity_1.TaskActivityEntity)),
    __param(7, (0, common_1.Inject)((0, common_1.forwardRef)(() => notification_service_1.NotificationService))),
    __param(8, (0, common_1.Inject)((0, common_1.forwardRef)(() => notification_gateway_1.NotificationGateway))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        assignee_defaults_service_1.AssigneeDefaultsService,
        nestjs_cls_1.ClsService,
        activity_log_service_1.ActivityLogService,
        notification_service_1.NotificationService,
        notification_gateway_1.NotificationGateway])
], TaskService);
//# sourceMappingURL=task.service.js.map