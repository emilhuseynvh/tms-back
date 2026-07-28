import { Repository } from 'typeorm';
import { ChatRoomEntity } from '../../entities/chat-room.entity';
import { ChatRoomMemberEntity } from '../../entities/chat-room-member.entity';
import { MessageEntity } from '../../entities/message.entity';
import { UserEntity } from '../../entities/user.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { RemoveMemberDto } from './dto/remove-member.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { CreateDirectChatDto } from './dto/create-direct-chat.dto';
import { UploadsEntity } from '../../entities/uploads.entity';
import { ClsService } from 'nestjs-cls';
export declare class ChatService {
    private chatRoomRepo;
    private memberRepo;
    private messageRepo;
    private userRepo;
    private uploadRepo;
    private cls;
    constructor(chatRoomRepo: Repository<ChatRoomEntity>, memberRepo: Repository<ChatRoomMemberEntity>, messageRepo: Repository<MessageEntity>, userRepo: Repository<UserEntity>, uploadRepo: Repository<UploadsEntity>, cls: ClsService);
    createDirectChat(userId: number, params: CreateDirectChatDto): Promise<ChatRoomEntity>;
    createGroup(userId: number, params: CreateGroupDto): Promise<ChatRoomEntity>;
    addMembers(userId: number, params: AddMemberDto): Promise<ChatRoomEntity>;
    private addSystemMessage;
    private actorName;
    removeMember(userId: number, params: RemoveMemberDto): Promise<ChatRoomEntity>;
    setAdmin(userId: number, params: {
        roomId: number;
        userId: number;
        isAdmin: boolean;
    }): Promise<ChatRoomEntity>;
    updateGroup(userId: number, params: UpdateGroupDto): Promise<ChatRoomEntity>;
    getRoomById(roomId: number, userId: number): Promise<ChatRoomEntity>;
    getUserRooms(userId: number): Promise<ChatRoomEntity[]>;
    getMessages(roomId: number, userId: number, page?: number, limit?: number): Promise<MessageEntity[]>;
    sendMessage(roomId: number, senderId: number, content: string): Promise<MessageEntity | null>;
    editMessage(messageId: number, userId: number, content: string): Promise<MessageEntity | null>;
    markAsRead(roomId: number, userId: number): Promise<void>;
    search(userId: number, query: string): Promise<{
        users: UserEntity[];
        messages: any[];
    }>;
}
