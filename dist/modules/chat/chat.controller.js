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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const chat_service_1 = require("./chat.service");
const create_group_dto_1 = require("./dto/create-group.dto");
const add_member_dto_1 = require("./dto/add-member.dto");
const create_direct_chat_dto_1 = require("./dto/create-direct-chat.dto");
const send_message_body_dto_1 = require("./dto/send-message-body.dto");
const nestjs_cls_1 = require("nestjs-cls");
const auth_decorator_1 = require("../../shared/decorators/auth.decorator");
let ChatController = class ChatController {
    chatService;
    cls;
    constructor(chatService, cls) {
        this.chatService = chatService;
        this.cls = cls;
    }
    async createDirectChat(params) {
        const user = this.cls.get('user');
        return await this.chatService.createDirectChat(user.id, params);
    }
    async createGroup(params) {
        const user = this.cls.get('user');
        return await this.chatService.createGroup(user.id, params);
    }
    async addMember(params) {
        const user = this.cls.get('user');
        return await this.chatService.addMembers(user.id, params);
    }
    async getRooms() {
        const user = this.cls.get('user');
        return await this.chatService.getUserRooms(user.id);
    }
    async getRoom(roomId) {
        const user = this.cls.get('user');
        return await this.chatService.getRoomById(roomId, user.id);
    }
    async getMessages(roomId, page = 1, limit = 50) {
        const user = this.cls.get('user');
        return await this.chatService.getMessages(roomId, user.id, page, limit);
    }
    async sendMessage(roomId, params) {
        const user = this.cls.get('user');
        return await this.chatService.sendMessage(roomId, user.id, params.content);
    }
    async markAsRead(roomId) {
        const user = this.cls.get('user');
        await this.chatService.markAsRead(roomId, user.id);
        return { message: 'Mesajlar oxundu olaraq işarələndi!' };
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Post)('direct'),
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Direct chat yaratmaq' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_direct_chat_dto_1.CreateDirectChatDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createDirectChat", null);
__decorate([
    (0, common_1.Post)('group'),
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Qrup yaratmaq' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_group_dto_1.CreateGroupDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createGroup", null);
__decorate([
    (0, common_1.Post)('group/add-member'),
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Qrupa üzv əlavə etmək' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [add_member_dto_1.AddMemberDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "addMember", null);
__decorate([
    (0, common_1.Get)('rooms'),
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Bütün chat otaqlarını almaq' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getRooms", null);
__decorate([
    (0, common_1.Get)('rooms/:roomId'),
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Xüsusi otaq məlumatlarını almaq' }),
    (0, swagger_1.ApiParam)({ name: 'roomId', type: Number }),
    __param(0, (0, common_1.Param)('roomId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getRoom", null);
__decorate([
    (0, common_1.Get)('rooms/:roomId/messages'),
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Mesajları almaq' }),
    (0, swagger_1.ApiParam)({ name: 'roomId', type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Param)('roomId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)('rooms/:roomId/messages'),
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Mesaj göndərmək' }),
    (0, swagger_1.ApiParam)({ name: 'roomId', type: Number, description: 'Chat otağının ID-si' }),
    __param(0, (0, common_1.Param)('roomId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, send_message_body_dto_1.SendMessageBodyDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Post)('rooms/:roomId/read'),
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Mesajları oxundu olaraq işarələmək' }),
    (0, swagger_1.ApiParam)({ name: 'roomId', type: Number }),
    __param(0, (0, common_1.Param)('roomId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "markAsRead", null);
exports.ChatController = ChatController = __decorate([
    (0, swagger_1.ApiTags)('chat'),
    (0, common_1.Controller)('chat'),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        nestjs_cls_1.ClsService])
], ChatController);
//# sourceMappingURL=chat.controller.js.map