import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThanOrEqual, MoreThan, Repository, IsNull } from "typeorm";
import { Cron, CronExpression } from "@nestjs/schedule";
import { TaskNotificationEntity } from "../../entities/task-notification.entity";
import { NotificationSettingsEntity } from "../../entities/notification-settings.entity";
import { NotificationEntity, NotificationType } from "../../entities/notification.entity";
import { TaskEntity } from "../../entities/task.entity";
import { UpdateNotificationSettingsDto } from "./dto/update-settings.dto";
import { ClsService } from "nestjs-cls";

@Injectable()
export class NotificationService implements OnModuleInit {
	constructor(
		@InjectRepository(TaskNotificationEntity)
		private taskNotificationRepo: Repository<TaskNotificationEntity>,
		@InjectRepository(NotificationSettingsEntity)
		private settingsRepo: Repository<NotificationSettingsEntity>,
		@InjectRepository(NotificationEntity)
		private notificationRepo: Repository<NotificationEntity>,
		@InjectRepository(TaskEntity)
		private taskRepo: Repository<TaskEntity>,
		private cls: ClsService
	) { }

	// Modul başlayanda default settings yarat
	async onModuleInit() {
		const settings = await this.settingsRepo.find()
		if (settings.length === 0) {
			await this.settingsRepo.save({
				hoursBeforeDue: 2,
				isEnabled: true
			})
		}
	}

	// Settings-i əldə et
	async getSettings(): Promise<NotificationSettingsEntity> {
		const settings = await this.settingsRepo.find()
		return settings[0]
	}

	// Settings-i yenilə
	async updateSettings(dto: UpdateNotificationSettingsDto): Promise<NotificationSettingsEntity> {
		const settings = await this.getSettings()
		Object.assign(settings, dto)
		return await this.settingsRepo.save(settings)
	}

	// Task-a user assign olunanda notification record yarat
	async createNotificationRecord(taskId: number, userId: number): Promise<TaskNotificationEntity> {
		const existing = await this.taskNotificationRepo.findOne({
			where: { taskId, userId }
		})

		if (existing) {
			return existing
		}

		const notification = this.taskNotificationRepo.create({
			taskId,
			userId,
			notifiedAt: null
		})
		return await this.taskNotificationRepo.save(notification)
	}

	// User task-dan çıxarılanda notification record-u sil
	async removeNotificationRecord(taskId: number, userId: number): Promise<void> {
		await this.taskNotificationRepo.delete({ taskId, userId })
	}

	// Task silinəndə bütün notification record-ları sil
	async removeAllNotificationsForTask(taskId: number): Promise<void> {
		await this.taskNotificationRepo.delete({ taskId })
	}

	// Bildiriş göndərildi olaraq işarələ
	async markAsNotified(taskId: number, userId: number): Promise<void> {
		await this.taskNotificationRepo.update(
			{ taskId, userId },
			{ notifiedAt: new Date() }
		)
	}

	// Göndərilməmiş bildirişləri əldə et
	async getPendingNotifications(): Promise<{
		task: TaskEntity,
		userIds: number[]
	}[]> {
		const settings = await this.getSettings()

		if (!settings.isEnabled) {
			return []
		}

		const now = new Date()
		const notificationTime = new Date(now.getTime() + settings.hoursBeforeDue * 60 * 60 * 1000)

		// dueAt olan və vaxtı yaxınlaşan taskları tap
		const tasks = await this.taskRepo.find({
			where: {
				dueAt: LessThanOrEqual(notificationTime),
				deletedAt: IsNull()
			},
			relations: ['assignees']
		})

		const result: { task: TaskEntity, userIds: number[] }[] = []

		for (const task of tasks) {
			if (!task.dueAt || task.dueAt <= now) continue // Vaxtı keçmişləri atla
			if (!task.assignees || task.assignees.length === 0) continue

			// Bu task üçün göndərilməmiş bildirişləri tap
			const pendingNotifications = await this.taskNotificationRepo.find({
				where: {
					taskId: task.id,
					notifiedAt: IsNull()
				}
			})

			const pendingUserIds = pendingNotifications.map(n => n.userId)

			// Assign edilmiş amma notification record-u olmayan userləri əlavə et
			for (const assignee of task.assignees) {
				const exists = await this.taskNotificationRepo.findOne({
					where: { taskId: task.id, userId: assignee.id }
				})
				if (!exists) {
					await this.createNotificationRecord(task.id, assignee.id)
					pendingUserIds.push(assignee.id)
				}
			}

			if (pendingUserIds.length > 0) {
				result.push({ task, userIds: pendingUserIds })
			}
		}

		return result
	}

	// Hər 5 dəqiqədə bir yoxla
	@Cron(CronExpression.EVERY_5_MINUTES)
	async checkAndSendNotifications(): Promise<{ task: TaskEntity, userIds: number[] }[]> {
		const pendingNotifications = await this.getPendingNotifications()
		return pendingNotifications
	}

	// User üçün göndərilməmiş bildirişləri əldə et
	async getUserPendingNotifications(userId: number): Promise<TaskEntity[]> {
		const settings = await this.getSettings()

		if (!settings.isEnabled) {
			return []
		}

		const now = new Date()
		const notificationTime = new Date(now.getTime() + settings.hoursBeforeDue * 60 * 60 * 1000)

		const notifications = await this.taskNotificationRepo.find({
			where: {
				userId,
				notifiedAt: IsNull()
			},
			relations: ['task']
		})

		const tasks: TaskEntity[] = []

		for (const notification of notifications) {
			const task = await this.taskRepo.findOne({
				where: { id: notification.taskId },
				relations: ['assignees', 'status']
			})

			if (task && task.dueAt && task.dueAt > now && task.dueAt <= notificationTime) {
				tasks.push(task)
			}
		}

		return tasks
	}

	async createNotification(
		userId: number,
		type: NotificationType,
		title: string,
		message: string,
		taskId?: number
	): Promise<NotificationEntity> {
		const notification = this.notificationRepo.create({
			userId,
			type,
			title,
			message,
			taskId: taskId || null,
			isRead: false
		})
		return await this.notificationRepo.save(notification)
	}

	async getUserNotifications(
		userId: number,
		filter: 'all' | 'unread' | 'read' = 'all',
		page: number = 1,
		limit: number = 20
	): Promise<{ data: NotificationEntity[], total: number, hasMore: boolean }> {
		const where: any = { userId }

		if (filter === 'unread') {
			where.isRead = false
		} else if (filter === 'read') {
			where.isRead = true
		}

		const [data, total] = await this.notificationRepo.findAndCount({
			where,
			order: { createdAt: 'DESC' },
			skip: (page - 1) * limit,
			take: limit,
			relations: ['task']
		})

		return {
			data,
			total,
			hasMore: page * limit < total
		}
	}

	async getUnreadCount(userId: number): Promise<number> {
		return await this.notificationRepo.count({
			where: { userId, isRead: false }
		})
	}

	async markNotificationAsRead(notificationId: number, userId: number): Promise<NotificationEntity | null> {
		const notification = await this.notificationRepo.findOne({
			where: { id: notificationId, userId }
		})

		if (!notification) return null

		notification.isRead = true
		return await this.notificationRepo.save(notification)
	}

	async markAllAsRead(userId: number): Promise<void> {
		await this.notificationRepo.update(
			{ userId, isRead: false },
			{ isRead: true }
		)
	}

	async deleteNotification(notificationId: number, userId: number): Promise<boolean> {
		const result = await this.notificationRepo.delete({
			id: notificationId,
			userId
		})
		return (result.affected || 0) > 0
	}

	async clearAllNotifications(userId: number): Promise<void> {
		await this.notificationRepo.delete({ userId })
	}

	async notifyTaskAssigned(taskId: number, userId: number, taskTitle: string): Promise<NotificationEntity> {
		return await this.createNotification(
			userId,
			NotificationType.TASK_ASSIGNED,
			'Yeni tapşırıq təyin edildi',
			`Sizə "${taskTitle}" tapşırığı təyin edildi`,
			taskId
		)
	}

	async notifyTaskUnassigned(taskId: number, userId: number, taskTitle: string): Promise<NotificationEntity> {
		return await this.createNotification(
			userId,
			NotificationType.TASK_UNASSIGNED,
			'Tapşırıqdan çıxarıldınız',
			`"${taskTitle}" tapşırığından çıxarıldınız`,
			taskId
		)
	}

	async notifyTaskDeadline(taskId: number, userId: number, taskTitle: string, hoursLeft: number): Promise<NotificationEntity> {
		return await this.createNotification(
			userId,
			NotificationType.TASK_DEADLINE,
			'Deadline yaxınlaşır',
			`"${taskTitle}" tapşırığının bitmə vaxtına ${hoursLeft} saat qalıb`,
			taskId
		)
	}

	async notifyTaskUpdated(taskId: number, userId: number, taskTitle: string, updatedBy: string): Promise<NotificationEntity> {
		return await this.createNotification(
			userId,
			NotificationType.TASK_UPDATED,
			'Tapşırıq yeniləndi',
			`"${taskTitle}" tapşırığı ${updatedBy} tərəfindən yeniləndi`,
			taskId
		)
	}
}
