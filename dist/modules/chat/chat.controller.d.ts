import { ChatService } from './chat.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { RemoveMemberDto } from './dto/remove-member.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { SetAdminDto } from './dto/set-admin.dto';
import { CreateDirectChatDto } from './dto/create-direct-chat.dto';
import { SendMessageBodyDto } from './dto/send-message-body.dto';
import { ClsService } from 'nestjs-cls';
import { ChatGateway } from './chat.gateway';
export declare class ChatController {
    private chatService;
    private cls;
    private chatGateway;
    constructor(chatService: ChatService, cls: ClsService, chatGateway: ChatGateway);
    private broadcastSystemMessages;
    createDirectChat(params: CreateDirectChatDto): Promise<import("../../entities/chat-room.entity").ChatRoomEntity>;
    createGroup(params: CreateGroupDto): Promise<import("../../entities/chat-room.entity").ChatRoomEntity>;
    addMember(params: AddMemberDto): Promise<any>;
    removeMember(params: RemoveMemberDto): Promise<any>;
    updateGroup(params: UpdateGroupDto): Promise<any>;
    setAdmin(params: SetAdminDto): Promise<any>;
    getRooms(): Promise<import("../../entities/chat-room.entity").ChatRoomEntity[]>;
    getRoom(roomId: number): Promise<import("../../entities/chat-room.entity").ChatRoomEntity>;
    getMessages(roomId: number, page?: number, limit?: number): Promise<import("../../entities/message.entity").MessageEntity[]>;
    sendMessage(roomId: number, params: SendMessageBodyDto): Promise<import("../../entities/message.entity").MessageEntity | null>;
    editMessage(messageId: number, params: SendMessageBodyDto): Promise<import("../../entities/message.entity").MessageEntity | null>;
    markAsRead(roomId: number): Promise<{
        message: string;
    }>;
    search(query: string): Promise<{
        users: import("../../entities/user.entity").UserEntity[];
        messages: any[];
    }>;
}
