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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const user_service_1 = require("../user/user.service");
const notification_service_1 = require("./notification.service");
const schedule_1 = require("@nestjs/schedule");
let NotificationGateway = class NotificationGateway {
    jwtService;
    userService;
    notificationService;
    server;
    userSockets = new Map();
    constructor(jwtService, userService, notificationService) {
        this.jwtService = jwtService;
        this.userService = userService;
        this.notificationService = notificationService;
    }
    async handleConnection(client) {
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
            await this.sendPendingNotificationsToUser(user.id);
        }
        catch (error) {
            console.log('Notification auth error:', error.message);
            client.disconnect();
        }
    }
    extractTokenFromHandshake(handshake) {
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
    async handleDisconnect(client) {
        const user = client.data.user;
        if (!user)
            return;
        const sockets = this.userSockets.get(user.id);
        if (sockets) {
            sockets.delete(client.id);
            if (sockets.size === 0) {
                this.userSockets.delete(user.id);
            }
        }
    }
    emitToUser(userId, event, data) {
        const sockets = this.userSockets.get(userId);
        if (sockets) {
            sockets.forEach((socketId) => {
                this.server.to(socketId).emit(event, data);
            });
        }
    }
    emitNewNotification(userId, notification) {
        this.emitToUser(userId, 'notification:new', notification);
    }
    emitUnreadCountUpdate(userId, count) {
        this.emitToUser(userId, 'notification:count', { count });
    }
    async sendPendingNotificationsToUser(userId) {
        const tasks = await this.notificationService.getUserPendingNotifications(userId);
        for (const task of tasks) {
            this.emitToUser(userId, 'task:due-reminder', {
                taskId: task.id,
                title: task.title,
                dueAt: task.dueAt,
                status: task.status?.name,
            });
            await this.notificationService.markAsNotified(task.id, userId);
        }
    }
    async checkAllOnlineUsers() {
        console.log('Checking notifications for online users...');
        for (const [userId] of this.userSockets) {
            await this.sendPendingNotificationsToUser(userId);
        }
    }
};
exports.NotificationGateway = NotificationGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationGateway.prototype, "server", void 0);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationGateway.prototype, "checkAllOnlineUsers", null);
exports.NotificationGateway = NotificationGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
        namespace: '/notifications',
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        user_service_1.UserService,
        notification_service_1.NotificationService])
], NotificationGateway);
//# sourceMappingURL=notification.gateway.js.map