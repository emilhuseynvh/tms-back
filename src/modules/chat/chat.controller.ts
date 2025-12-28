import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { CreateDirectChatDto } from './dto/create-direct-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { SendMessageBodyDto } from './dto/send-message-body.dto';
import { ClsService } from 'nestjs-cls';
import { Auth } from 'src/shared/decorators/auth.decorator';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
    constructor(
        private chatService: ChatService,
        private cls: ClsService,
    ) {}

    @Post('direct')
    @Auth()
    @ApiOperation({ summary: 'Direct chat yaratmaq' })
    async createDirectChat(@Body() params: CreateDirectChatDto) {
        const user = this.cls.get('user');
        return await this.chatService.createDirectChat(user.id, params);
    }

    @Post('group')
    @Auth()
    @ApiOperation({ summary: 'Qrup yaratmaq' })
    async createGroup(@Body() params: CreateGroupDto) {
        const user = this.cls.get('user');
        return await this.chatService.createGroup(user.id, params);
    }

    @Post('group/add-member')
    @Auth()
    @ApiOperation({ summary: 'Qrupa üzv əlavə etmək' })
    async addMember(@Body() params: AddMemberDto) {
        const user = this.cls.get('user');
        return await this.chatService.addMembers(user.id, params);
    }

    @Get('rooms')
    @Auth()
    @ApiOperation({ summary: 'Bütün chat otaqlarını almaq' })
    async getRooms() {
        const user = this.cls.get('user');
        return await this.chatService.getUserRooms(user.id);
    }

    @Get('rooms/:roomId')
    @Auth()
    @ApiOperation({ summary: 'Xüsusi otaq məlumatlarını almaq' })
    @ApiParam({ name: 'roomId', type: Number })
    async getRoom(@Param('roomId', ParseIntPipe) roomId: number) {
        const user = this.cls.get('user');
        return await this.chatService.getRoomById(roomId, user.id);
    }

    @Get('rooms/:roomId/messages')
    @Auth()
    @ApiOperation({ summary: 'Mesajları almaq' })
    @ApiParam({ name: 'roomId', type: Number })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getMessages(
        @Param('roomId', ParseIntPipe) roomId: number,
        @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
        @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 50,
    ) {
        const user = this.cls.get('user');
        return await this.chatService.getMessages(roomId, user.id, page, limit);
    }

    @Post('rooms/:roomId/messages')
    @Auth()
    @ApiOperation({ summary: 'Mesaj göndərmək' })
    @ApiParam({ name: 'roomId', type: Number, description: 'Chat otağının ID-si' })
    async sendMessage(
        @Param('roomId', ParseIntPipe) roomId: number,
        @Body() params: SendMessageBodyDto,
    ) {
        const user = this.cls.get('user');
        return await this.chatService.sendMessage(roomId, user.id, params.content);
    }

    @Post('rooms/:roomId/read')
    @Auth()
    @ApiOperation({ summary: 'Mesajları oxundu olaraq işarələmək' })
    @ApiParam({ name: 'roomId', type: Number })
    async markAsRead(@Param('roomId', ParseIntPipe) roomId: number) {
        const user = this.cls.get('user');
        await this.chatService.markAsRead(roomId, user.id);
        return { message: 'Mesajlar oxundu olaraq işarələndi!' };
    }

    @Get('search')
    @Auth()
    @ApiOperation({ summary: 'İstifadəçilər və mesajlar arasında axtarış' })
    @ApiQuery({ name: 'q', required: true, type: String, description: 'Axtarış sorğusu' })
    async search(@Query('q') query: string) {
        const user = this.cls.get('user');
        return await this.chatService.search(user.id, query);
    }
}

