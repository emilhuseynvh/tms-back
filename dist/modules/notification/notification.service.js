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
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const schedule_1 = require("@nestjs/schedule");
const task_notification_entity_1 = require("../../entities/task-notification.entity");
const notification_settings_entity_1 = require("../../entities/notification-settings.entity");
const notification_entity_1 = require("../../entities/notification.entity");
const task_entity_1 = require("../../entities/task.entity");
const nestjs_cls_1 = require("nestjs-cls");
let NotificationService = class NotificationService {
    taskNotificationRepo;
    settingsRepo;
    notificationRepo;
    taskRepo;
    cls;
    constructor(taskNotificationRepo, settingsRepo, notificationRepo, taskRepo, cls) {
        this.taskNotificationRepo = taskNotificationRepo;
        this.settingsRepo = settingsRepo;
        this.notificationRepo = notificationRepo;
        this.taskRepo = taskRepo;
        this.cls = cls;
    }
    async onModuleInit() {
        const settings = await this.settingsRepo.find();
        if (settings.length === 0) {
            await this.settingsRepo.save({
                hoursBeforeDue: 2,
                isEnabled: true
            });
        }
    }
    async getSettings() {
        const settings = await this.settingsRepo.find();
        return settings[0];
    }
    async updateSettings(dto) {
        const settings = await this.getSettings();
        Object.assign(settings, dto);
        return await this.settingsRepo.save(settings);
    }
    async createNotificationRecord(taskId, userId) {
        const existing = await this.taskNotificationRepo.findOne({
            where: { taskId, userId }
        });
        if (existing) {
            return existing;
        }
        const notification = this.taskNotificationRepo.create({
            taskId,
            userId,
            notifiedAt: null
        });
        return await this.taskNotificationRepo.save(notification);
    }
    async removeNotificationRecord(taskId, userId) {
        await this.taskNotificationRepo.delete({ taskId, userId });
    }
    async removeAllNotificationsForTask(taskId) {
        await this.taskNotificationRepo.delete({ taskId });
    }
    async markAsNotified(taskId, userId) {
        await this.taskNotificationRepo.update({ taskId, userId }, { notifiedAt: new Date() });
    }
    async getPendingNotifications() {
        const settings = await this.getSettings();
        if (!settings.isEnabled) {
            return [];
        }
        const now = new Date();
        const notificationTime = new Date(now.getTime() + settings.hoursBeforeDue * 60 * 60 * 1000);
        const tasks = await this.taskRepo.find({
            where: {
                dueAt: (0, typeorm_2.LessThanOrEqual)(notificationTime),
                deletedAt: (0, typeorm_2.IsNull)()
            },
            relations: ['assignees']
        });
        const result = [];
        for (const task of tasks) {
            if (!task.dueAt || task.dueAt <= now)
                continue;
            if (!task.assignees || task.assignees.length === 0)
                continue;
            const pendingNotifications = await this.taskNotificationRepo.find({
                where: {
                    taskId: task.id,
                    notifiedAt: (0, typeorm_2.IsNull)()
                }
            });
            const pendingUserIds = pendingNotifications.map(n => n.userId);
            for (const assignee of task.assignees) {
                const exists = await this.taskNotificationRepo.findOne({
                    where: { taskId: task.id, userId: assignee.id }
                });
                if (!exists) {
                    await this.createNotificationRecord(task.id, assignee.id);
                    pendingUserIds.push(assignee.id);
                }
            }
            if (pendingUserIds.length > 0) {
                result.push({ task, userIds: pendingUserIds });
            }
        }
        return result;
    }
    async checkAndSendNotifications() {
        const pendingNotifications = await this.getPendingNotifications();
        return pendingNotifications;
    }
    async getUserPendingNotifications(userId) {
        const settings = await this.getSettings();
        if (!settings.isEnabled) {
            return [];
        }
        const now = new Date();
        const notificationTime = new Date(now.getTime() + settings.hoursBeforeDue * 60 * 60 * 1000);
        const notifications = await this.taskNotificationRepo.find({
            where: {
                userId,
                notifiedAt: (0, typeorm_2.IsNull)()
            },
            relations: ['task']
        });
        const tasks = [];
        for (const notification of notifications) {
            const task = await this.taskRepo.findOne({
                where: { id: notification.taskId },
                relations: ['assignees', 'status']
            });
            if (task && task.dueAt && task.dueAt > now && task.dueAt <= notificationTime) {
                tasks.push(task);
            }
        }
        return tasks;
    }
    async createNotification(userId, type, title, message, taskId) {
        const notification = this.notificationRepo.create({
            userId,
            type,
            title,
            message,
            taskId: taskId || null,
            isRead: false
        });
        return await this.notificationRepo.save(notification);
    }
    async getUserNotifications(userId, filter = 'all', page = 1, limit = 20) {
        const where = { userId };
        if (filter === 'unread') {
            where.isRead = false;
        }
        else if (filter === 'read') {
            where.isRead = true;
        }
        const [data, total] = await this.notificationRepo.findAndCount({
            where,
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
            relations: ['task']
        });
        return {
            data,
            total,
            hasMore: page * limit < total
        };
    }
    async getUnreadCount(userId) {
        return await this.notificationRepo.count({
            where: { userId, isRead: false }
        });
    }
    async markNotificationAsRead(notificationId, userId) {
        const notification = await this.notificationRepo.findOne({
            where: { id: notificationId, userId }
        });
        if (!notification)
            return null;
        notification.isRead = true;
        return await this.notificationRepo.save(notification);
    }
    async markAllAsRead(userId) {
        await this.notificationRepo.update({ userId, isRead: false }, { isRead: true });
    }
    async deleteNotification(notificationId, userId) {
        const result = await this.notificationRepo.delete({
            id: notificationId,
            userId
        });
        return (result.affected || 0) > 0;
    }
    async clearAllNotifications(userId) {
        await this.notificationRepo.delete({ userId });
    }
    async notifyTaskAssigned(taskId, userId, taskTitle) {
        return await this.createNotification(userId, notification_entity_1.NotificationType.TASK_ASSIGNED, 'Yeni tapşırıq təyin edildi', `Sizə "${taskTitle}" tapşırığı təyin edildi`, taskId);
    }
    async notifyTaskUnassigned(taskId, userId, taskTitle) {
        return await this.createNotification(userId, notification_entity_1.NotificationType.TASK_UNASSIGNED, 'Tapşırıqdan çıxarıldınız', `"${taskTitle}" tapşırığından çıxarıldınız`, taskId);
    }
    async notifyTaskDeadline(taskId, userId, taskTitle, hoursLeft) {
        return await this.createNotification(userId, notification_entity_1.NotificationType.TASK_DEADLINE, 'Deadline yaxınlaşır', `"${taskTitle}" tapşırığının bitmə vaxtına ${hoursLeft} saat qalıb`, taskId);
    }
    async notifyTaskUpdated(taskId, userId, taskTitle, updatedBy) {
        return await this.createNotification(userId, notification_entity_1.NotificationType.TASK_UPDATED, 'Tapşırıq yeniləndi', `"${taskTitle}" tapşırığı ${updatedBy} tərəfindən yeniləndi`, taskId);
    }
};
exports.NotificationService = NotificationService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationService.prototype, "checkAndSendNotifications", null);
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_notification_entity_1.TaskNotificationEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(notification_settings_entity_1.NotificationSettingsEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(notification_entity_1.NotificationEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(task_entity_1.TaskEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        nestjs_cls_1.ClsService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map