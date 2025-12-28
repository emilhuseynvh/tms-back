import {
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { NotificationService } from './notification.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@WebSocketGateway({
	cors: {
		origin: '*',
	},
	namespace: '/notifications',
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	private userSockets = new Map<number, Set<string>>();

	constructor(
		private jwtService: JwtService,
		private userService: UserService,
		private notificationService: NotificationService,
	) { }

	async handleConnection(client: Socket) {
		try {
			const token = this.extractTokenFromHandshake(client.handshake);

			if (!token) {
				client.disconnect();
				return;
			}

			const payload = this.jwtService.verify(token);
			if (!payload.userId) {
				client.disconnect();
				return;
			}

			const user = await this.userService.getUserById(payload.userId);
			if (!user) {
				client.disconnect();
				return;
			}

			client.data.user = user;
			console.log('User connected to notifications:', user.id, user.username);

			if (!this.userSockets.has(user.id)) {
				this.userSockets.set(user.id, new Set());
			}
			const userSockets = this.userSockets.get(user.id);
			if (userSockets) {
				userSockets.add(client.id);
			}

			// Bağlanan kimi göndərilməmiş bildirişləri yoxla
			await this.sendPendingNotificationsToUser(user.id);
		} catch (error) {
			console.log('Notification auth error:', error.message);
			client.disconnect();
		}
	}

	private extractTokenFromHandshake(handshake: any): string | undefined {
		const authHeader = handshake?.headers?.authorization || handshake?.headers?.Authorization;
		if (authHeader) {
			const [scheme, token] = authHeader.split(' ');
			if (scheme?.toLowerCase() === 'bearer' && token) {
				return token;
			}
		}

		const tokenFromQuery = handshake?.query?.token || handshake?.auth?.token;
		if (tokenFromQuery) {
			return tokenFromQuery;
		}

		return undefined;
	}

	async handleDisconnect(client: Socket) {
		const user = client.data.user;
		if (!user) return;

		const sockets = this.userSockets.get(user.id);
		if (sockets) {
			sockets.delete(client.id);
			if (sockets.size === 0) {
				this.userSockets.delete(user.id);
			}
		}
	}

	// User-ə bildiriş göndər
	emitToUser(userId: number, event: string, data: any) {
		const sockets = this.userSockets.get(userId);
		if (sockets) {
			sockets.forEach((socketId) => {
				this.server.to(socketId).emit(event, data);
			});
		}
	}

	// User-ə göndərilməmiş bildirişləri göndər
	async sendPendingNotificationsToUser(userId: number) {
		const tasks = await this.notificationService.getUserPendingNotifications(userId);

		for (const task of tasks) {
			this.emitToUser(userId, 'task:due-reminder', {
				taskId: task.id,
				title: task.title,
				dueAt: task.dueAt,
				status: task.status?.name,
			});

			// Bildiriş göndərildi olaraq işarələ
			await this.notificationService.markAsNotified(task.id, userId);
		}
	}

	// Hər 5 dəqiqədə bir bütün online userləri yoxla
	@Cron(CronExpression.EVERY_5_MINUTES)
	async checkAllOnlineUsers() {
		console.log('Checking notifications for online users...');

		for (const [userId] of this.userSockets) {
			await this.sendPendingNotificationsToUser(userId);
		}
	}
}
