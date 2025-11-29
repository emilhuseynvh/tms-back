"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const chat_room_entity_1 = require("../../entities/chat-room.entity");
const chat_room_member_entity_1 = require("../../entities/chat-room-member.entity");
const message_entity_1 = require("../../entities/message.entity");
const user_entity_1 = require("../../entities/user.entity");
const chat_room_type_enum_1 = require("../../shared/enums/chat-room-type.enum");
let ChatService = class ChatService {
    chatRoomRepo;
    memberRepo;
    messageRepo;
    userRepo;
    constructor(chatRoomRepo, memberRepo, messageRepo, userRepo) {
        this.chatRoomRepo = chatRoomRepo;
        this.memberRepo = memberRepo;
        this.messageRepo = messageRepo;
        this.userRepo = userRepo;
    }
    async createDirectChat(userId, params) {
        const otherUser = await this.userRepo.findOne({
            where: { id: params.userId },
        });
        if (!otherUser) {
            throw new common_1.NotFoundException('İstifadəçi tapılmadı!');
        }
        if (userId === params.userId) {
            throw new common_1.BadRequestException('Özünüzlə chat yarada bilməzsiniz!');
        }
        const userRooms = await this.memberRepo
            .createQueryBuilder('member')
            .innerJoin('member.room', 'room')
            .where('member.userId = :userId', { userId })
            .andWhere('room.type = :type', { type: chat_room_type_enum_1.ChatRoomType.DIRECT })
            .getMany();
        let existingRoom = null;
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
            type: chat_room_type_enum_1.ChatRoomType.DIRECT,
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
    async createGroup(userId, params) {
        if (params.memberIds.includes(userId)) {
            throw new common_1.BadRequestException('Özünüzü qrupa əlavə edə bilməzsiniz! Siz avtomatik olaraq qrupa əlavə olunacaqsınız.');
        }
        const memberIds = [...new Set([userId, ...params.memberIds])];
        const users = await this.userRepo.findBy({ id: (0, typeorm_2.In)(memberIds) });
        if (users.length !== memberIds.length) {
            throw new common_1.NotFoundException('Bəzi istifadəçilər tapılmadı!');
        }
        const room = this.chatRoomRepo.create({
            name: params.name,
            description: params.description,
            type: chat_room_type_enum_1.ChatRoomType.GROUP,
            createdById: userId,
        });
        await room.save();
        const members = memberIds.map((memberId) => this.memberRepo.create({
            roomId: room.id,
            userId: memberId,
            isAdmin: memberId === userId,
        }));
        await this.memberRepo.save(members);
        return await this.getRoomById(room.id, userId);
    }
    async addMembers(userId, params) {
        const room = await this.chatRoomRepo.findOne({
            where: { id: params.roomId },
            relations: ['members'],
        });
        if (!room) {
            throw new common_1.NotFoundException('Chat tapılmadı!');
        }
        if (room.type === chat_room_type_enum_1.ChatRoomType.DIRECT) {
            throw new common_1.BadRequestException('Direct chat-ə üzv əlavə edilə bilməz!');
        }
        const userMember = room.members.find((m) => m.userId === userId);
        if (!userMember) {
            throw new common_1.ForbiddenException('Bu chat-ə giriş hüququnuz yoxdur!');
        }
        if (params.userIds.includes(userId)) {
            throw new common_1.BadRequestException('Özünüzü qrupa əlavə edə bilməzsiniz!');
        }
        const users = await this.userRepo.findBy({ id: (0, typeorm_2.In)(params.userIds) });
        if (users.length !== params.userIds.length) {
            throw new common_1.NotFoundException('Bəzi istifadəçilər tapılmadı!');
        }
        const existingMemberIds = room.members.map((m) => m.userId);
        const newMemberIds = params.userIds.filter((id) => !existingMemberIds.includes(id));
        if (newMemberIds.length === 0) {
            throw new common_1.BadRequestException('Bütün istifadəçilər artıq üzvdür!');
        }
        const members = newMemberIds.map((memberId) => this.memberRepo.create({
            roomId: room.id,
            userId: memberId,
            isAdmin: false,
        }));
        await this.memberRepo.save(members);
        return await this.getRoomById(room.id, userId);
    }
    async getRoomById(roomId, userId) {
        const room = await this.chatRoomRepo.findOne({
            where: { id: roomId },
            relations: ['members', 'members.user', 'members.user.avatar', 'createdBy', 'createdBy.avatar'],
        });
        if (!room) {
            throw new common_1.NotFoundException('Chat tapılmadı!');
        }
        const isMember = room.members.some((m) => m.userId === userId);
        if (!isMember) {
            throw new common_1.ForbiddenException('Bu chat-ə giriş hüququnuz yoxdur!');
        }
        if (room.type === chat_room_type_enum_1.ChatRoomType.DIRECT) {
            const otherMember = room.members.find((m) => m.userId !== userId);
            if (otherMember) {
                room.name = otherMember.user.username;
                room.otherUser = otherMember.user;
            }
        }
        return room;
    }
    async getUserRooms(userId) {
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
            room.lastMessage = lastMessage;
            const unreadCount = await this.messageRepo
                .createQueryBuilder('message')
                .where('message.roomId = :roomId', { roomId: room.id })
                .andWhere('message.senderId != :userId', { userId })
                .andWhere('message.isRead = :isRead', { isRead: false })
                .getCount();
            room.unreadCount = unreadCount;
        }
        rooms.forEach((room) => {
            if (room.type === chat_room_type_enum_1.ChatRoomType.DIRECT) {
                const otherMember = room.members.find((m) => m.userId !== userId);
                if (otherMember) {
                    room.name = otherMember.user.username;
                    room.otherUser = otherMember.user;
                }
            }
        });
        return rooms;
    }
    async getMessages(roomId, userId, page = 1, limit = 50) {
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
    async sendMessage(roomId, senderId, content) {
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
    async markAsRead(roomId, userId) {
        await this.messageRepo
            .createQueryBuilder()
            .update(message_entity_1.MessageEntity)
            .set({ isRead: true })
            .where('roomId = :roomId', { roomId })
            .andWhere('senderId != :userId', { userId })
            .execute();
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(chat_room_entity_1.ChatRoomEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(chat_room_member_entity_1.ChatRoomMemberEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(message_entity_1.MessageEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object, typeof (_d = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _d : Object])
], ChatService);
//# sourceMappingURL=chat.service.js.map