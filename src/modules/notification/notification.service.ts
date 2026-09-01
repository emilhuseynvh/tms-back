import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThanOrEqual, MoreThan, Repository, IsNull, Like } from "typeorm";
import { Cron, CronExpression } from "@nestjs/schedule";
import { TaskNotificationEntity } from "../../entities/task-notification.entity";
import { NotificationSettingsEntity } from "../../entities/notification-settings.entity";
import { NotificationEntity, NotificationType } from "../../entities/notification.entity";
import { TaskEntity } from "../../entities/task.entity";
import { UpdateNotificationSettingsDto } from "./dto/update-settings.dto";
import { ClsService } from "nestjs-cls";
import { resolveFilterDateRange } from "../../shared/utils/filter-date.utils";

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

	// Taska təyin edilmiş seçilmiş istifadəçilərə xüsusi mesaj bildirişi göndər
	async sendTaskMessage(sender: { id: number; username?: string }, taskId: number, userIds: number[], message: string) {
		const task = await this.taskRepo.findOne({ where: { id: taskId } })
		if (!task) {
			throw new Error('Tapşırıq tapılmadı!')
		}

		// Özünə də göndərmək mümkündür (özünə xatırlatma kimi)
		const targetIds = [...new Set(userIds)]

		const notifications: NotificationEntity[] = []
		for (const userId of targetIds) {
			notifications.push(await this.createNotification({
				userId,
				type: NotificationType.TASK_MESSAGE,
				title: `"${task.title}" tapşırığı üzrə mesaj`,
				message: `${sender.username || 'İstifadəçi'}: ${message}`,
				taskId: task.id,
				actorId: sender.id ?? null,
			}))
		}

		return { message: `${targetIds.length} istifadəçiyə bildiriş göndərildi!`, notifications }
	}

	async createNotification(data: {
		userId: number,
		type: NotificationType,
		title: string,
		message: string,
		taskId?: number,
		spaceId?: number,
		folderId?: number,
		listId?: number,
		actorId?: number | null
	}): Promise<NotificationEntity> {
		const currentUser = this.cls.get('user')
		const actorId = data.actorId !== undefined ? data.actorId : (currentUser?.id ?? null)
		const notification = this.notificationRepo.create({
			userId: data.userId,
			type: data.type,
			title: data.title,
			message: data.message,
			taskId: data.taskId || null,
			spaceId: data.spaceId || null,
			folderId: data.folderId || null,
			listId: data.listId || null,
			actorId,
			isRead: false
		})
		return await this.notificationRepo.save(notification)
	}

	async getUserNotifications(
		userId: number,
		filter: 'all' | 'unread' | 'read' = 'all',
		page: number = 1,
		limit: number = 20,
		search?: string,
		person?: string,
		startDate?: string,
		endDate?: string
	): Promise<{ data: NotificationEntity[], total: number, hasMore: boolean }> {
		const qb = this.notificationRepo.createQueryBuilder('n')
			.leftJoinAndSelect('n.task', 'task')
			.leftJoinAndSelect('task.taskList', 'taskList')
			.leftJoinAndSelect('taskList.folder', 'taskListFolder')
			.leftJoinAndSelect('taskListFolder.space', 'taskListFolderSpace')
			.leftJoinAndSelect('taskList.space', 'taskListSpace')
			.leftJoinAndSelect('n.list', 'list')
			.leftJoinAndSelect('list.folder', 'listFolder')
			.leftJoinAndSelect('listFolder.space', 'listFolderSpace')
			.leftJoinAndSelect('list.space', 'listSpace')
			.leftJoinAndSelect('n.folder', 'folder')
			.leftJoinAndSelect('folder.space', 'folderSpace')
			.leftJoinAndSelect('n.space', 'space')
			.leftJoinAndSelect('n.actor', 'actor')
			.where('n.userId = :userId', { userId })

		if (filter === 'unread') {
			qb.andWhere('n.isRead = :isRead', { isRead: false })
		} else if (filter === 'read') {
			qb.andWhere('n.isRead = :isRead', { isRead: true })
		}

		// Axtarış: başlıq və mesaj üzrə
		const term = search?.trim()
		if (term) {
			qb.andWhere('(n.title LIKE :term OR n.message LIKE :term)', { term: `%${term}%` })
		}

		// Şəxs: bildiriş mətnində keçən istifadəçi adına görə
		const personTerm = person?.trim()
		if (personTerm) {
			qb.andWhere(
				'(actor.username LIKE :person OR n.title LIKE :person OR n.message LIKE :person)',
				{ person: `%${personTerm}%` }
			)
		}

		// Tarix aralığı
		const { start: rangeStart, end: rangeEnd } = resolveFilterDateRange(startDate, endDate)
		if (rangeStart) {
			qb.andWhere('n.createdAt >= :rangeStart', { rangeStart })
		}
		if (rangeEnd) {
			qb.andWhere('n.createdAt <= :rangeEnd', { rangeEnd })
		}

		const [data, total] = await qb
			.orderBy('n.createdAt', 'DESC')
			.skip((page - 1) * limit)
			.take(limit)
			.getManyAndCount()

		// Hər bildiriş üçün keçid URL-i hesabla (kliklə həmin yerə getmək üçün)
		const buildListUrl = (list: any): string | null => {
			if (!list) return null
			let base: string | null = null
			if (list.folderId && list.folder?.spaceId) {
				base = `/tasks/space/${list.folder.spaceId}/folder/${list.folderId}`
			} else if (list.spaceId) {
				base = `/tasks/space/${list.spaceId}`
			}
			if (!base) return null
			const segment = list.type === 'meeting' ? 'note' : 'list'
			return `${base}/${segment}/${list.id}`
		}

		const mapped = data.map((n: any) => {
			const list = n.task?.taskList || n.list || null
			const folder = list?.folder || n.folder || null
			const space = folder?.space || list?.space || n.space || null
			const parts: string[] = []
			if (space?.name) parts.push(space.name)
			if (folder?.name) parts.push(folder.name)
			if (list?.name) parts.push(list.name)
			if (n.task?.title) parts.push(n.task.title)

			let url: string | null = null
			if (list) {
				url = buildListUrl(list)
			} else if (folder) {
				url = folder.spaceId ? `/tasks/space/${folder.spaceId}/folder/${folder.id}` : null
			} else if (n.spaceId || space?.id) {
				url = `/tasks/space/${n.spaceId || space.id}`
			}

			return {
				...n,
				actor: n.actor
					? { id: n.actor.id, username: n.actor.username, shortName: n.actor.shortName }
					: null,
				location: parts.length ? parts.join(' / ') : null,
				url,
			}
		})

		return {
			data: mapped,
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
		return await this.createNotification({
			userId,
			type: NotificationType.TASK_ASSIGNED,
			title: 'Yeni tapşırıq təyin edildi',
			message: `Sizə "${taskTitle}" tapşırığı təyin edildi`,
			taskId
		})
	}

	async notifyTaskUnassigned(taskId: number, userId: number, taskTitle: string): Promise<NotificationEntity> {
		return await this.createNotification({
			userId,
			type: NotificationType.TASK_UNASSIGNED,
			title: 'Tapşırıqdan çıxarıldınız',
			message: `"${taskTitle}" tapşırığından çıxarıldınız`,
			taskId
		})
	}

	async notifyTaskDeadline(taskId: number, userId: number, taskTitle: string, hoursLeft: number): Promise<NotificationEntity> {
		return await this.createNotification({
			userId,
			type: NotificationType.TASK_DEADLINE,
			title: 'Deadline yaxınlaşır',
			message: `"${taskTitle}" tapşırığının bitmə vaxtına ${hoursLeft} saat qalıb`,
			taskId,
			actorId: null,
		})
	}

	async notifyTaskUpdated(taskId: number, userId: number, taskTitle: string, updatedBy: string): Promise<NotificationEntity> {
		return await this.createNotification({
			userId,
			type: NotificationType.TASK_UPDATED,
			title: 'Tapşırıq yeniləndi',
			message: `"${taskTitle}" tapşırığı ${updatedBy} tərəfindən yeniləndi`,
			taskId
		})
	}
}
