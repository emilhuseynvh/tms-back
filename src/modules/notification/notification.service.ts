import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThanOrEqual, MoreThan, Repository, IsNull } from "typeorm";
import { Cron, CronExpression } from "@nestjs/schedule";
import { TaskNotificationEntity } from "../../entities/task-notification.entity";
import { NotificationSettingsEntity } from "../../entities/notification-settings.entity";
import { TaskEntity } from "../../entities/task.entity";
import { UpdateNotificationSettingsDto } from "./dto/update-settings.dto";

@Injectable()
export class NotificationService implements OnModuleInit {
	constructor(
		@InjectRepository(TaskNotificationEntity)
		private taskNotificationRepo: Repository<TaskNotificationEntity>,
		@InjectRepository(NotificationSettingsEntity)
		private settingsRepo: Repository<NotificationSettingsEntity>,
		@InjectRepository(TaskEntity)
		private taskRepo: Repository<TaskEntity>,
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
}
