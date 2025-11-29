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
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const ws_auth_guard_1 = require("../../guard/ws-auth.guard");
const chat_service_1 = require("./chat.service");
const send_message_dto_1 = require("./dto/send-message.dto");
const jwt_1 = require("@nestjs/jwt");
const user_service_1 = require("../user/user.service");
let ChatGateway = class ChatGateway {
    chatService;
    jwtService;
    userService;
    server;
    userSockets = new Map();
    constructor(chatService, jwtService, userService) {
        this.chatService = chatService;
        this.jwtService = jwtService;
        this.userService = userService;
    }
    async handleConnection(client) {
        try {
            const token = this.extractTokenFromHandshake(client.handshake);
            if (!token) {
                console.log('No token found, disconnecting');
                client.disconnect();
                return;
            }
            const payload = this.jwtService.verify(token);
            if (!payload.userId) {
                console.log('Invalid token payload, disconnecting');
                client.disconnect();
                return;
            }
            const user = await this.userService.getUserById(payload.userId);
            if (!user) {
                console.log('User not found, disconnecting');
                client.disconnect();
                return;
            }
            client.data.user = user;
            console.log('User connected to chat:', user.id, user.username);
            if (!this.userSockets.has(user.id)) {
                this.userSockets.set(user.id, new Set());
            }
            const userSockets = this.userSockets.get(user.id);
            if (userSockets) {
                userSockets.add(client.id);
            }
            const rooms = await this.chatService.getUserRooms(user.id);
            rooms.forEach((room) => {
                client.join(`room:${room.id}`);
            });
            this.server.emit('user:online', { userId: user.id });
        }
        catch (error) {
            console.log('Authentication error:', error.message);
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
                this.server.emit('user:offline', { userId: user.id });
            }
        }
    }
    async handleMessage(data, client) {
        const user = client.data.user;
        try {
            const message = await this.chatService.sendMessage(data.roomId, user.id, data.content);
            await this.chatService.markAsRead(data.roomId, user.id);
            client.broadcast.to(`room:${data.roomId}`).emit('message:new', message);
            this.server.to(`room:${data.roomId}`).emit('message:read', {
                roomId: data.roomId,
                userId: user.id,
            });
            return { success: true, message };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async handleJoinRoom(data, client) {
        const user = client.data.user;
        try {
            await this.chatService.getRoomById(data.roomId, user.id);
            client.join(`room:${data.roomId}`);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async handleLeaveRoom(data, client) {
        client.leave(`room:${data.roomId}`);
        return { success: true };
    }
    async handleMarkAsRead(data, client) {
        const user = client.data.user;
        try {
            await this.chatService.markAsRead(data.roomId, user.id);
            this.server.to(`room:${data.roomId}`).emit('message:read', {
                roomId: data.roomId,
                userId: user.id,
            });
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message };
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
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('message:send'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_message_dto_1.SendMessageDto,
        socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('room:join'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('room:leave'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleLeaveRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('message:read'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMarkAsRead", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
        namespace: '/chat',
    }),
    (0, common_1.UseGuards)(ws_auth_guard_1.WsAuthGuard),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        jwt_1.JwtService,
        user_service_1.UserService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map