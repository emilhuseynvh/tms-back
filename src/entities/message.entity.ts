import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { ChatRoomEntity } from './chat-room.entity';

@Entity('message')
export class MessageEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    content: string;

    @Column()
    roomId: number;

    @ManyToOne(() => ChatRoomEntity, (room) => room.messages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'roomId' })
    room: ChatRoomEntity;

    @Column()
    senderId: number;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'senderId' })
    sender: UserEntity;

    @Column({ type: 'boolean', default: false, nullable: false })
    isRead: boolean;

    @Column({ type: 'boolean', default: false })
    isEdited: boolean;

    // Sistem mesajı (üzv əlavə/çıxarma, şəkil/ad dəyişikliyi və s.)
    @Column({ type: 'boolean', default: false })
    isSystem: boolean;

    // Köhnə versiyalar: [{ content, editedAt }]
    @Column({ type: 'json', nullable: true })
    editHistory: { content: string; editedAt: string }[] | null;

    @CreateDateColumn()
    createdAt: Date;
}

