import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatRoomEntity } from '../../entities/chat-room.entity';
import { ChatRoomMemberEntity } from '../../entities/chat-room-member.entity';
import { MessageEntity } from '../../entities/message.entity';
import { UserEntity } from '../../entities/user.entity';
import { WsAuthGuard } from '../../guard/ws-auth.guard';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ChatRoomEntity,
            ChatRoomMemberEntity,
            MessageEntity,
            UserEntity,
        ]),
    ],
    controllers: [ChatController],
    providers: [ChatService, ChatGateway, WsAuthGuard],
    exports: [ChatService],
})
export class ChatModule {}

