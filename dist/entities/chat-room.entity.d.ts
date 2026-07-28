import { BaseEntity } from 'typeorm';
import { UserEntity } from './user.entity';
import { UploadsEntity } from './uploads.entity';
import { ChatRoomMemberEntity } from './chat-room-member.entity';
import { MessageEntity } from './message.entity';
import { ChatRoomType } from 'src/shared/enums/chat-room-type.enum';
export declare class ChatRoomEntity extends BaseEntity {
    id: number;
    name: string;
    description: string;
    type: ChatRoomType;
    avatarId: number | null;
    avatar: UploadsEntity | null;
    createdById: number;
    createdBy: UserEntity;
    members: ChatRoomMemberEntity[];
    messages: MessageEntity[];
    createdAt: Date;
    updatedAt: Date;
}
