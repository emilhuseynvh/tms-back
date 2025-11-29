import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    JoinColumn,
    Unique,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { ChatRoomEntity } from './chat-room.entity';

@Entity('chat_room_member')
@Unique(['roomId', 'userId'])
export class ChatRoomMemberEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    roomId: number;

    @ManyToOne(() => ChatRoomEntity, (room) => room.members, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'roomId' })
    room: ChatRoomEntity;

    @Column()
    userId: number;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: UserEntity;

    @Column({ default: false })
    isAdmin: boolean; // For group chats

    @CreateDateColumn()
    joinedAt: Date;
}

