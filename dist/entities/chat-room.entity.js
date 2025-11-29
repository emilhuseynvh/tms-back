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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRoomEntity = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const chat_room_member_entity_1 = require("./chat-room-member.entity");
const message_entity_1 = require("./message.entity");
const chat_room_type_enum_1 = require("../shared/enums/chat-room-type.enum");
let ChatRoomEntity = class ChatRoomEntity extends typeorm_1.BaseEntity {
    id;
    name;
    description;
    type;
    createdById;
    createdBy;
    members;
    messages;
    createdAt;
    updatedAt;
};
exports.ChatRoomEntity = ChatRoomEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ChatRoomEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ChatRoomEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ChatRoomEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: chat_room_type_enum_1.ChatRoomType, default: chat_room_type_enum_1.ChatRoomType.DIRECT }),
    __metadata("design:type", String)
], ChatRoomEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ChatRoomEntity.prototype, "createdById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity),
    (0, typeorm_1.JoinColumn)({ name: 'createdById' }),
    __metadata("design:type", user_entity_1.UserEntity)
], ChatRoomEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => chat_room_member_entity_1.ChatRoomMemberEntity, (member) => member.room),
    __metadata("design:type", Array)
], ChatRoomEntity.prototype, "members", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => message_entity_1.MessageEntity, (message) => message.room),
    __metadata("design:type", Array)
], ChatRoomEntity.prototype, "messages", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ChatRoomEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ChatRoomEntity.prototype, "updatedAt", void 0);
exports.ChatRoomEntity = ChatRoomEntity = __decorate([
    (0, typeorm_1.Entity)('chat_room')
], ChatRoomEntity);
//# sourceMappingURL=chat-room.entity.js.map