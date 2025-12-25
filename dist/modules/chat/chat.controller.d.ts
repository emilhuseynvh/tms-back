import { ChatService } from './chat.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { CreateDirectChatDto } from './dto/create-direct-chat.dto';
import { SendMessageBodyDto } from './dto/send-message-body.dto';
import { ClsService } from 'nestjs-cls';
export declare class ChatController {
    private chatService;
    private cls;
    constructor(chatService: ChatService, cls: ClsService);
    createDirectChat(params: CreateDirectChatDto): Promise<import("../../entities/chat-room.entity").ChatRoomEntity>;
    createGroup(params: CreateGroupDto): Promise<import("../../entities/chat-room.entity").ChatRoomEntity>;
    addMember(params: AddMemberDto): Promise<import("../../entities/chat-room.entity").ChatRoomEntity>;
    getRooms(): Promise<import("../../entities/chat-room.entity").ChatRoomEntity[]>;
    getRoom(roomId: number): Promise<import("../../entities/chat-room.entity").ChatRoomEntity>;
    getMessages(roomId: number, page?: number, limit?: number): Promise<import("../../entities/message.entity").MessageEntity[]>;
    sendMessage(roomId: number, params: SendMessageBodyDto): Promise<import("../../entities/message.entity").MessageEntity | null>;
    markAsRead(roomId: number): Promise<{
        message: string;
    }>;
}
