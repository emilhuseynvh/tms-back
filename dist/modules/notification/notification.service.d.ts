import { OnModuleInit } from "@nestjs/common";
import { Repository } from "typeorm";
import { TaskNotificationEntity } from "../../entities/task-notification.entity";
import { NotificationSettingsEntity } from "../../entities/notification-settings.entity";
import { NotificationEntity, NotificationType } from "../../entities/notification.entity";
import { TaskEntity } from "../../entities/task.entity";
import { UpdateNotificationSettingsDto } from "./dto/update-settings.dto";
import { ClsService } from "nestjs-cls";
export declare class NotificationService implements OnModuleInit {
    private taskNotificationRepo;
    private settingsRepo;
    private notificationRepo;
    private taskRepo;
    private cls;
    constructor(taskNotificationRepo: Repository<TaskNotificationEntity>, settingsRepo: Repository<NotificationSettingsEntity>, notificationRepo: Repository<NotificationEntity>, taskRepo: Repository<TaskEntity>, cls: ClsService);
    onModuleInit(): Promise<void>;
    getSettings(): Promise<NotificationSettingsEntity>;
    updateSettings(dto: UpdateNotificationSettingsDto): Promise<NotificationSettingsEntity>;
    createNotificationRecord(taskId: number, userId: number): Promise<TaskNotificationEntity>;
    removeNotificationRecord(taskId: number, userId: number): Promise<void>;
    removeAllNotificationsForTask(taskId: number): Promise<void>;
    markAsNotified(taskId: number, userId: number): Promise<void>;
    getPendingNotifications(): Promise<{
        task: TaskEntity;
        userIds: number[];
    }[]>;
    checkAndSendNotifications(): Promise<{
        task: TaskEntity;
        userIds: number[];
    }[]>;
    getUserPendingNotifications(userId: number): Promise<TaskEntity[]>;
    createNotification(userId: number, type: NotificationType, title: string, message: string, taskId?: number): Promise<NotificationEntity>;
    getUserNotifications(userId: number, filter?: 'all' | 'unread' | 'read', page?: number, limit?: number): Promise<{
        data: NotificationEntity[];
        total: number;
        hasMore: boolean;
    }>;
    getUnreadCount(userId: number): Promise<number>;
    markNotificationAsRead(notificationId: number, userId: number): Promise<NotificationEntity | null>;
    markAllAsRead(userId: number): Promise<void>;
    deleteNotification(notificationId: number, userId: number): Promise<boolean>;
    clearAllNotifications(userId: number): Promise<void>;
    notifyTaskAssigned(taskId: number, userId: number, taskTitle: string): Promise<NotificationEntity>;
    notifyTaskUnassigned(taskId: number, userId: number, taskTitle: string): Promise<NotificationEntity>;
    notifyTaskDeadline(taskId: number, userId: number, taskTitle: string, hoursLeft: number): Promise<NotificationEntity>;
    notifyTaskUpdated(taskId: number, userId: number, taskTitle: string, updatedBy: string): Promise<NotificationEntity>;
}
