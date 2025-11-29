import { BaseEntity } from 'typeorm';
import { UserEntity } from './user.entity';
import { ChatRoomEntity } from './chat-room.entity';
export declare class MessageEntity extends BaseEntity {
    id: number;
    content: string;
    roomId: number;
    room: ChatRoomEntity;
    senderId: number;
    sender: UserEntity;
    isRead: boolean;
    createdAt: Date;
}
