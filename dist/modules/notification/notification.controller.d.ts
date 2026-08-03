import { NotificationService } from "./notification.service";
import { NotificationGateway } from "./notification.gateway";
import { UpdateNotificationSettingsDto } from "./dto/update-settings.dto";
import { SendTaskNotificationDto } from "./dto/send-task-notification.dto";
import { ClsService } from "nestjs-cls";
export declare class NotificationController {
    private notificationService;
    private notificationGateway;
    private cls;
    constructor(notificationService: NotificationService, notificationGateway: NotificationGateway, cls: ClsService);
    getMyNotifications(filter?: 'all' | 'unread' | 'read', page?: string, limit?: string, search?: string): Promise<{
        data: import("../../entities/notification.entity").NotificationEntity[];
        total: number;
        hasMore: boolean;
    }>;
    sendTaskNotification(body: SendTaskNotificationDto): Promise<{
        message: string;
    }>;
    getUnreadCount(): Promise<{
        count: number;
    }>;
    markAsRead(id: string): Promise<{
        success: boolean;
        notification: import("../../entities/notification.entity").NotificationEntity | null;
    }>;
    markAllAsRead(): Promise<{
        success: boolean;
    }>;
    deleteNotification(id: string): Promise<{
        success: boolean;
    }>;
    clearAll(): Promise<{
        success: boolean;
    }>;
    getSettings(): Promise<import("../../entities/notification-settings.entity").NotificationSettingsEntity>;
    updateSettings(dto: UpdateNotificationSettingsDto): Promise<import("../../entities/notification-settings.entity").NotificationSettingsEntity>;
}
