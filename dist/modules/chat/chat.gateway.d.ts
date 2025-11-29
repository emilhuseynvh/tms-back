import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private chatService;
    private jwtService;
    private userService;
    server: Server;
    private userSockets;
    constructor(chatService: ChatService, jwtService: JwtService, userService: UserService);
    handleConnection(client: Socket): Promise<void>;
    private extractTokenFromHandshake;
    handleDisconnect(client: Socket): Promise<void>;
    handleMessage(data: SendMessageDto, client: Socket): Promise<{
        success: boolean;
        message: import("../../entities/message.entity").MessageEntity | null;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
    }>;
    handleJoinRoom(data: {
        roomId: number;
    }, client: Socket): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    }>;
    handleLeaveRoom(data: {
        roomId: number;
    }, client: Socket): Promise<{
        success: boolean;
    }>;
    handleMarkAsRead(data: {
        roomId: number;
    }, client: Socket): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    }>;
    emitToUser(userId: number, event: string, data: any): void;
}
