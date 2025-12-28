import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ChatRoomEntity } from '../../entities/chat-room.entity';
import { ChatRoomMemberEntity } from '../../entities/chat-room-member.entity';
import { MessageEntity } from '../../entities/message.entity';
import { UserEntity } from '../../entities/user.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { CreateDirectChatDto } from './dto/create-direct-chat.dto';
import { ChatRoomType } from 'src/shared/enums/chat-room-type.enum';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(ChatRoomEntity)
        private chatRoomRepo: Repository<ChatRoomEntity>,
        @InjectRepository(ChatRoomMemberEntity)
        private memberRepo: Repository<ChatRoomMemberEntity>,
        @InjectRepository(MessageEntity)
        private messageRepo: Repository<MessageEntity>,
        @InjectRepository(UserEntity)
        private userRepo: Repository<UserEntity>,
    ) {}

    async createDirectChat(userId: number, params: CreateDirectChatDto) {
        const otherUser = await this.userRepo.findOne({
            where: { id: params.userId },
        });

        if (!otherUser) {
            throw new NotFoundException('İstifadəçi tapılmadı!');
        }

        if (userId === params.userId) {
            throw new BadRequestException('Özünüzlə chat yarada bilməzsiniz!');
        }

        const userRooms = await this.memberRepo
            .createQueryBuilder('member')
            .innerJoin('member.room', 'room')
            .where('member.userId = :userId', { userId })
            .andWhere('room.type = :type', { type: ChatRoomType.DIRECT })
            .getMany();

        let existingRoom: ChatRoomEntity | null = null;
        for (const userMember of userRooms) {
            const otherMember = await this.memberRepo.findOne({
                where: { roomId: userMember.roomId, userId: params.userId },
            });

            if (otherMember) {
                const memberCount = await this.memberRepo.count({
                    where: { roomId: userMember.roomId },
                });
                if (memberCount === 2) {
                    const room = await this.chatRoomRepo.findOne({
                        where: { id: userMember.roomId },
                    });
                    if (room) {
                        existingRoom = room;
                        break;
                    }
                }
            }
        }

        if (existingRoom) {
            return await this.getRoomById(existingRoom.id, userId);
        }

        const room = this.chatRoomRepo.create({
            type: ChatRoomType.DIRECT,
        });
        await room.save();

        const member1 = this.memberRepo.create({
            roomId: room.id,
            userId,
        });
        await member1.save();

        const member2 = this.memberRepo.create({
            roomId: room.id,
            userId: params.userId,
        });
        await member2.save();

        return await this.getRoomById(room.id, userId);
    }

    async createGroup(userId: number, params: CreateGroupDto) {
        // Prevent user from adding themselves explicitly
        if (params.memberIds.includes(userId)) {
            throw new BadRequestException('Özünüzü qrupa əlavə edə bilməzsiniz! Siz avtomatik olaraq qrupa əlavə olunacaqsınız.');
        }

        const memberIds = [...new Set([userId, ...params.memberIds])];

        const users = await this.userRepo.findBy({ id: In(memberIds) });
        if (users.length !== memberIds.length) {
            throw new NotFoundException('Bəzi istifadəçilər tapılmadı!');
        }

        const room = this.chatRoomRepo.create({
            name: params.name,
            description: params.description,
            type: ChatRoomType.GROUP,
            createdById: userId,
        });
        await room.save();

        const members = memberIds.map((memberId) =>
            this.memberRepo.create({
                roomId: room.id,
                userId: memberId,
                isAdmin: memberId === userId,
            }),
        );

        await this.memberRepo.save(members);

        return await this.getRoomById(room.id, userId);
    }

    async addMembers(userId: number, params: AddMemberDto) {
        const room = await this.chatRoomRepo.findOne({
            where: { id: params.roomId },
            relations: ['members'],
        });

        if (!room) {
            throw new NotFoundException('Chat tapılmadı!');
        }

        if (room.type === ChatRoomType.DIRECT) {
            throw new BadRequestException('Direct chat-ə üzv əlavə edilə bilməz!');
        }

        const userMember = room.members.find((m) => m.userId === userId);
        if (!userMember) {
            throw new ForbiddenException('Bu chat-ə giriş hüququnuz yoxdur!');
        }

        // Prevent user from adding themselves
        if (params.userIds.includes(userId)) {
            throw new BadRequestException('Özünüzü qrupa əlavə edə bilməzsiniz!');
        }

        const users = await this.userRepo.findBy({ id: In(params.userIds) });
        if (users.length !== params.userIds.length) {
            throw new NotFoundException('Bəzi istifadəçilər tapılmadı!');
        }

        const existingMemberIds = room.members.map((m) => m.userId);
        const newMemberIds = params.userIds.filter(
            (id) => !existingMemberIds.includes(id),
        );

        if (newMemberIds.length === 0) {
            throw new BadRequestException('Bütün istifadəçilər artıq üzvdür!');
        }

        const members = newMemberIds.map((memberId) =>
            this.memberRepo.create({
                roomId: room.id,
                userId: memberId,
                isAdmin: false,
            }),
        );

        await this.memberRepo.save(members);

        return await this.getRoomById(room.id, userId);
    }

    async getRoomById(roomId: number, userId: number) {
        const room = await this.chatRoomRepo.findOne({
            where: { id: roomId },
            relations: ['members', 'members.user', 'members.user.avatar', 'createdBy', 'createdBy.avatar'],
        });

        if (!room) {
            throw new NotFoundException('Chat tapılmadı!');
        }

        const isMember = room.members.some((m) => m.userId === userId);
        if (!isMember) {
            throw new ForbiddenException('Bu chat-ə giriş hüququnuz yoxdur!');
        }

        if (room.type === ChatRoomType.DIRECT) {
            const otherMember = room.members.find((m) => m.userId !== userId);
            if (otherMember) {
                room.name = otherMember.user.username;
                (room as any).otherUser = otherMember.user;
            }
        }

        return room;
    }

    async getUserRooms(userId: number) {
        const rooms = await this.chatRoomRepo
            .createQueryBuilder('room')
            .innerJoin('room.members', 'member', 'member.userId = :userId', {
                userId,
            })
            .leftJoinAndSelect('room.members', 'members')
            .leftJoinAndSelect('members.user', 'user')
            .leftJoinAndSelect('user.avatar', 'avatar')
            .leftJoinAndSelect('room.createdBy', 'createdBy')
            .leftJoinAndSelect('createdBy.avatar', 'createdByAvatar')
            .orderBy('room.updatedAt', 'DESC')
            .getMany();

        for (const room of rooms) {
            const lastMessage = await this.messageRepo.findOne({
                where: { roomId: room.id },
                relations: ['sender', 'sender.avatar'],
                order: { createdAt: 'DESC' },
            });
            (room as any).lastMessage = lastMessage;

            // Add unread count (messages sent by others that are unread)
            const unreadCount = await this.messageRepo
                .createQueryBuilder('message')
                .where('message.roomId = :roomId', { roomId: room.id })
                .andWhere('message.senderId != :userId', { userId })
                .andWhere('message.isRead = :isRead', { isRead: false })
                .getCount();
            (room as any).unreadCount = unreadCount;
        }

        rooms.forEach((room) => {
            if (room.type === ChatRoomType.DIRECT) {
                const otherMember = room.members.find((m) => m.userId !== userId);
                if (otherMember) {
                    room.name = otherMember.user.username;
                    (room as any).otherUser = otherMember.user;
                }
            }
        });

        return rooms;
    }

    async getMessages(roomId: number, userId: number, page: number = 1, limit: number = 50) {
        const room = await this.getRoomById(roomId, userId);

        const messages = await this.messageRepo.find({
            where: { roomId },
            relations: ['sender', 'sender.avatar'],
            order: { createdAt: 'DESC' },
            take: limit,
            skip: (page - 1) * limit,
        });

        return messages.reverse(); 
    }

    async sendMessage(roomId: number, senderId: number, content: string) {
        const room = await this.getRoomById(roomId, senderId);

        const message = this.messageRepo.create({
            roomId,
            senderId,
            content,
        });

        await message.save();

        room.updatedAt = new Date();
        await room.save();

        return await this.messageRepo.findOne({
            where: { id: message.id },
            relations: ['sender', 'sender.avatar', 'room'],
        });
    }

    async markAsRead(roomId: number, userId: number) {
        await this.messageRepo
            .createQueryBuilder()
            .update(MessageEntity)
            .set({ isRead: true })
            .where('roomId = :roomId', { roomId })
            .andWhere('senderId != :userId', { userId })
            .execute();
    }

    async search(userId: number, query: string) {
        if (!query || query.trim().length < 2) {
            return { users: [], messages: [] };
        }

        const searchTerm = query.trim().toLowerCase();

        // Search users
        const users = await this.userRepo
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.avatar', 'avatar')
            .where('user.id != :userId', { userId })
            .andWhere(
                '(LOWER(user.username) LIKE :search OR LOWER(user.email) LIKE :search)',
                { search: `%${searchTerm}%` }
            )
            .take(10)
            .getMany();

        // Get user's room IDs
        const userRoomIds = await this.memberRepo
            .createQueryBuilder('member')
            .select('member.roomId')
            .where('member.userId = :userId', { userId })
            .getMany();

        const roomIds = userRoomIds.map(m => m.roomId);

        // Search messages in user's rooms
        let messages: any[] = [];
        if (roomIds.length > 0) {
            messages = await this.messageRepo
                .createQueryBuilder('message')
                .leftJoinAndSelect('message.sender', 'sender')
                .leftJoinAndSelect('sender.avatar', 'senderAvatar')
                .leftJoinAndSelect('message.room', 'room')
                .leftJoinAndSelect('room.members', 'members')
                .leftJoinAndSelect('members.user', 'memberUser')
                .leftJoinAndSelect('memberUser.avatar', 'memberAvatar')
                .where('message.roomId IN (:...roomIds)', { roomIds })
                .andWhere('LOWER(message.content) LIKE :search', { search: `%${searchTerm}%` })
                .orderBy('message.createdAt', 'DESC')
                .take(20)
                .getMany();

            // Add room display name for direct chats
            for (const message of messages) {
                if (message.room && message.room.type === ChatRoomType.DIRECT) {
                    const otherMember = message.room.members.find((m: any) => m.userId !== userId);
                    if (otherMember) {
                        message.room.name = otherMember.user.username;
                        (message.room as any).otherUser = otherMember.user;
                    }
                }
            }
        }

        return { users, messages };
    }
}

