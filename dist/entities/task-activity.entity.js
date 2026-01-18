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
exports.TaskActivityEntity = void 0;
const typeorm_1 = require("typeorm");
const task_entity_1 = require("./task.entity");
let TaskActivityEntity = class TaskActivityEntity extends typeorm_1.BaseEntity {
    id;
    taskId;
    task;
    userId;
    username;
    changes;
    createdAt;
};
exports.TaskActivityEntity = TaskActivityEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TaskActivityEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], TaskActivityEntity.prototype, "taskId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => task_entity_1.TaskEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'taskId' }),
    __metadata("design:type", task_entity_1.TaskEntity)
], TaskActivityEntity.prototype, "task", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], TaskActivityEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], TaskActivityEntity.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], TaskActivityEntity.prototype, "changes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], TaskActivityEntity.prototype, "createdAt", void 0);
exports.TaskActivityEntity = TaskActivityEntity = __decorate([
    (0, typeorm_1.Entity)('task_activity')
], TaskActivityEntity);
//# sourceMappingURL=task-activity.entity.js.map