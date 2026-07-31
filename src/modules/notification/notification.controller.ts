import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import AuthGuard from "../../guard/auth.guard";
import { RoleGuard } from "../../guard/role.guard";
import { Role } from "../../shared/decorators/role.decorator";
import { RoleEnum } from "../../shared/enums/role.enum";
import { NotificationService } from "./notification.service";
import { NotificationGateway } from "./notification.gateway";
import { UpdateNotificationSettingsDto } from "./dto/update-settings.dto";
import { SendTaskNotificationDto } from "./dto/send-task-notification.dto";
import { ClsService } from "nestjs-cls";

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationController {
	constructor(
		private notificationService: NotificationService,
		private notificationGateway: NotificationGateway,
		private cls: ClsService
	) { }

	@Get()
	@ApiQuery({ name: 'filter', required: false, enum: ['all', 'unread', 'read'] })
	@ApiQuery({ name: 'page', required: false })
	@ApiQuery({ name: 'limit', required: false })
	async getMyNotifications(
		@Query('filter') filter: 'all' | 'unread' | 'read' = 'all',
		@Query('page') page: string = '1',
		@Query('limit') limit: string = '20'
	) {
		const user = this.cls.get('user')
		return await this.notificationService.getUserNotifications(
			user.id,
			filter,
			parseInt(page),
			parseInt(limit)
		)
	}

	@Post('send')
	async sendTaskNotification(@Body() body: SendTaskNotificationDto) {
		const user = this.cls.get('user')
		const result = await this.notificationService.sendTaskMessage(user, body.taskId, body.userIds, body.message)

		// Real-time yayım: hər alan istifadəçiyə bildiriş + oxunmamış sayı
		for (const notification of result.notifications) {
			this.notificationGateway.emitNewNotification(notification.userId, notification)
			const count = await this.notificationService.getUnreadCount(notification.userId)
			this.notificationGateway.emitUnreadCountUpdate(notification.userId, count)
		}

		return { message: result.message }
	}

	@Get('unread-count')
	async getUnreadCount() {
		const user = this.cls.get('user')
		return { count: await this.notificationService.getUnreadCount(user.id) }
	}

	@Put(':id/read')
	async markAsRead(@Param('id') id: string) {
		const user = this.cls.get('user')
		const notification = await this.notificationService.markNotificationAsRead(parseInt(id), user.id)
		return { success: !!notification, notification }
	}

	@Put('read-all')
	async markAllAsRead() {
		const user = this.cls.get('user')
		await this.notificationService.markAllAsRead(user.id)
		return { success: true }
	}

	@Delete(':id')
	async deleteNotification(@Param('id') id: string) {
		const user = this.cls.get('user')
		const deleted = await this.notificationService.deleteNotification(parseInt(id), user.id)
		return { success: deleted }
	}

	@Delete('clear/all')
	async clearAll() {
		const user = this.cls.get('user')
		await this.notificationService.clearAllNotifications(user.id)
		return { success: true }
	}

	@Get('settings')
	@UseGuards(RoleGuard)
	@Role(RoleEnum.ADMIN)
	async getSettings() {
		return await this.notificationService.getSettings()
	}

	@Put('settings')
	@UseGuards(RoleGuard)
	@Role(RoleEnum.ADMIN)
	async updateSettings(@Body() dto: UpdateNotificationSettingsDto) {
		return await this.notificationService.updateSettings(dto)
	}
}
