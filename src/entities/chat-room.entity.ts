import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { ChatRoomMemberEntity } from './chat-room-member.entity';
import { MessageEntity } from './message.entity';
import { ChatRoomType } from 'src/shared/enums/chat-room-type.enum';



@Entity('chat_room')
export class ChatRoomEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    name: string; 

    @Column({ nullable: true })
    description: string;

    @Column({ type: 'enum', enum: ChatRoomType, default: ChatRoomType.DIRECT })
    type: ChatRoomType;

    @Column({ nullable: true })
    createdById: number; 

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'createdById' })
    createdBy: UserEntity;

    @OneToMany(() => ChatRoomMemberEntity, (member) => member.room)
    members: ChatRoomMemberEntity[];

    @OneToMany(() => MessageEntity, (message) => message.room)
    messages: MessageEntity[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

