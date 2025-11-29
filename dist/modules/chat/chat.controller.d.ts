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
    createDirectChat(params: CreateDirectChatDto): Promise<any>;
    createGroup(params: CreateGroupDto): Promise<any>;
    addMember(params: AddMemberDto): Promise<any>;
    getRooms(): Promise<any>;
    getRoom(roomId: number): Promise<any>;
    getMessages(roomId: number, page?: number, limit?: number): Promise<any>;
    sendMessage(roomId: number, params: SendMessageBodyDto): Promise<any>;
    markAsRead(roomId: number): Promise<{
        message: string;
    }>;
}
