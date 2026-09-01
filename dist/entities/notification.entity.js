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
exports.NotificationEntity = exports.NotificationType = void 0;
const typeorm_1 = require("typeorm");
const task_entity_1 = require("./task.entity");
const user_entity_1 = require("./user.entity");
const space_entity_1 = require("./space.entity");
const folder_entity_1 = require("./folder.entity");
const tasklist_entity_1 = require("./tasklist.entity");
var NotificationType;
(function (NotificationType) {
    NotificationType["TASK_ASSIGNED"] = "task_assigned";
    NotificationType["TASK_DEADLINE"] = "task_deadline";
    NotificationType["TASK_UPDATED"] = "task_updated";
    NotificationType["TASK_UNASSIGNED"] = "task_unassigned";
    NotificationType["SPACE_ASSIGNED"] = "space_assigned";
    NotificationType["SPACE_UNASSIGNED"] = "space_unassigned";
    NotificationType["FOLDER_ASSIGNED"] = "folder_assigned";
    NotificationType["FOLDER_UNASSIGNED"] = "folder_unassigned";
    NotificationType["LIST_ASSIGNED"] = "list_assigned";
    NotificationType["LIST_UNASSIGNED"] = "list_unassigned";
    NotificationType["TASK_MESSAGE"] = "task_message";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
let NotificationEntity = class NotificationEntity extends typeorm_1.BaseEntity {
    id;
    userId;
    type;
    title;
    message;
    taskId;
    isRead;
    user;
    task;
    spaceId;
    space;
    folderId;
    folder;
    listId;
    list;
    actorId;
    actor;
    createdAt;
};
exports.NotificationEntity = NotificationEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], NotificationEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], NotificationEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: NotificationType }),
    __metadata("design:type", String)
], NotificationEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], NotificationEntity.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], NotificationEntity.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Object)
], NotificationEntity.prototype, "taskId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], NotificationEntity.prototype, "isRead", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.UserEntity)
], NotificationEntity.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => task_entity_1.TaskEntity, { onDelete: 'CASCADE', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'taskId' }),
    __metadata("design:type", Object)
], NotificationEntity.prototype, "task", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Object)
], NotificationEntity.prototype, "spaceId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => space_entity_1.SpaceEntity, { onDelete: 'CASCADE', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'spaceId' }),
    __metadata("design:type", Object)
], NotificationEntity.prototype, "space", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Object)
], NotificationEntity.prototype, "folderId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => folder_entity_1.FolderEntity, { onDelete: 'CASCADE', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'folderId' }),
    __metadata("design:type", Object)
], NotificationEntity.prototype, "folder", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Object)
], NotificationEntity.prototype, "listId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tasklist_entity_1.TaskListEntity, { onDelete: 'CASCADE', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'listId' }),
    __metadata("design:type", Object)
], NotificationEntity.prototype, "list", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Object)
], NotificationEntity.prototype, "actorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { onDelete: 'SET NULL', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'actorId' }),
    __metadata("design:type", Object)
], NotificationEntity.prototype, "actor", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], NotificationEntity.prototype, "createdAt", void 0);
exports.NotificationEntity = NotificationEntity = __decorate([
    (0, typeorm_1.Entity)('notifications')
], NotificationEntity);
//# sourceMappingURL=notification.entity.js.map