import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsAuthGuard } from '../../guard/ws-auth.guard';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
    namespace: '/chat',
})
@UseGuards(WsAuthGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private userSockets = new Map<number, Set<string>>();

    constructor(
        private chatService: ChatService,
        private jwtService: JwtService,
        private userService: UserService,
    ) {}

    async handleConnection(client: Socket) {
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
        } catch (error) {
            console.log('Authentication error:', error.message);
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

        // Try to get token from query parameter
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
                this.server.emit('user:offline', { userId: user.id });
            }
        }
    }

    @SubscribeMessage('message:send')
    async handleMessage(
        @MessageBody() data: SendMessageDto,
        @ConnectedSocket() client: Socket,
    ) {
        const user = client.data.user;

        try {
            const message = await this.chatService.sendMessage(
                data.roomId,
                user.id,
                data.content,
            );

            // Mark all messages in this room as read for the sender
            await this.chatService.markAsRead(data.roomId, user.id);

            // Broadcast to all users in the room except the sender
            client.broadcast.to(`room:${data.roomId}`).emit('message:new', message);

            // Notify others that messages were read
            this.server.to(`room:${data.roomId}`).emit('message:read', {
                roomId: data.roomId,
                userId: user.id,
            });

            return { success: true, message };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    @SubscribeMessage('room:join')
    async handleJoinRoom(
        @MessageBody() data: { roomId: number },
        @ConnectedSocket() client: Socket,
    ) {
        const user = client.data.user;

        try {
            await this.chatService.getRoomById(data.roomId, user.id);
            client.join(`room:${data.roomId}`);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    @SubscribeMessage('room:leave')
    async handleLeaveRoom(
        @MessageBody() data: { roomId: number },
        @ConnectedSocket() client: Socket,
    ) {
        client.leave(`room:${data.roomId}`);
        return { success: true };
    }

    @SubscribeMessage('message:read')
    async handleMarkAsRead(
        @MessageBody() data: { roomId: number },
        @ConnectedSocket() client: Socket,
    ) {
        const user = client.data.user;

        try {
            await this.chatService.markAsRead(data.roomId, user.id);
            this.server.to(`room:${data.roomId}`).emit('message:read', {
                roomId: data.roomId,
                userId: user.id,
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    emitToUser(userId: number, event: string, data: any) {
        const sockets = this.userSockets.get(userId);
        if (sockets) {
            sockets.forEach((socketId) => {
                this.server.to(socketId).emit(event, data);
            });
        }
    }
}

