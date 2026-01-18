import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { NotificationService } from './notification.service';
export declare class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private userService;
    private notificationService;
    server: Server;
    private userSockets;
    constructor(jwtService: JwtService, userService: UserService, notificationService: NotificationService);
    handleConnection(client: Socket): Promise<void>;
    private extractTokenFromHandshake;
    handleDisconnect(client: Socket): Promise<void>;
    emitToUser(userId: number, event: string, data: any): void;
    emitNewNotification(userId: number, notification: any): void;
    emitUnreadCountUpdate(userId: number, count: number): void;
    sendPendingNotificationsToUser(userId: number): Promise<void>;
    checkAllOnlineUsers(): Promise<void>;
}
