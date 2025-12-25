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
exports.ActivityLogEntity = exports.ActivityType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
var ActivityType;
(function (ActivityType) {
    ActivityType["FOLDER_CREATE"] = "folder_create";
    ActivityType["FOLDER_UPDATE"] = "folder_update";
    ActivityType["FOLDER_DELETE"] = "folder_delete";
    ActivityType["FOLDER_RESTORE"] = "folder_restore";
    ActivityType["LIST_CREATE"] = "list_create";
    ActivityType["LIST_UPDATE"] = "list_update";
    ActivityType["LIST_DELETE"] = "list_delete";
    ActivityType["LIST_RESTORE"] = "list_restore";
    ActivityType["TASK_CREATE"] = "task_create";
    ActivityType["TASK_UPDATE"] = "task_update";
    ActivityType["TASK_DELETE"] = "task_delete";
    ActivityType["TASK_RESTORE"] = "task_restore";
})(ActivityType || (exports.ActivityType = ActivityType = {}));
let ActivityLogEntity = class ActivityLogEntity extends typeorm_1.BaseEntity {
    id;
    type;
    userId;
    user;
    entityId;
    entityName;
    changes;
    description;
    createdAt;
};
exports.ActivityLogEntity = ActivityLogEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ActivityLogEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ActivityType }),
    __metadata("design:type", String)
], ActivityLogEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ActivityLogEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { onDelete: 'SET NULL', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.UserEntity)
], ActivityLogEntity.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ActivityLogEntity.prototype, "entityId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ActivityLogEntity.prototype, "entityName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], ActivityLogEntity.prototype, "changes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ActivityLogEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ActivityLogEntity.prototype, "createdAt", void 0);
exports.ActivityLogEntity = ActivityLogEntity = __decorate([
    (0, typeorm_1.Entity)('activity_log')
], ActivityLogEntity);
//# sourceMappingURL=activity-log.entity.js.map