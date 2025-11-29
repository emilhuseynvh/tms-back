import { BaseEntity } from 'typeorm';
import { UserEntity } from './user.entity';
import { ChatRoomEntity } from './chat-room.entity';
export declare class ChatRoomMemberEntity extends BaseEntity {
    id: number;
    roomId: number;
    room: ChatRoomEntity;
    userId: number;
    user: UserEntity;
    isAdmin: boolean;
    joinedAt: Date;
}
