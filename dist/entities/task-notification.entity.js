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
exports.TaskNotificationEntity = void 0;
const typeorm_1 = require("typeorm");
const task_entity_1 = require("./task.entity");
const user_entity_1 = require("./user.entity");
let TaskNotificationEntity = class TaskNotificationEntity extends typeorm_1.BaseEntity {
    id;
    taskId;
    userId;
    notifiedAt;
    task;
    user;
    createdAt;
};
exports.TaskNotificationEntity = TaskNotificationEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TaskNotificationEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], TaskNotificationEntity.prototype, "taskId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], TaskNotificationEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], TaskNotificationEntity.prototype, "notifiedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => task_entity_1.TaskEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'taskId' }),
    __metadata("design:type", task_entity_1.TaskEntity)
], TaskNotificationEntity.prototype, "task", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.UserEntity)
], TaskNotificationEntity.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TaskNotificationEntity.prototype, "createdAt", void 0);
exports.TaskNotificationEntity = TaskNotificationEntity = __decorate([
    (0, typeorm_1.Entity)('task_notification'),
    (0, typeorm_1.Unique)(['taskId', 'userId'])
], TaskNotificationEntity);
//# sourceMappingURL=task-notification.entity.js.map