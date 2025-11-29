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
exports.TaskEntity = void 0;
const typeorm_1 = require("typeorm");
const tasklist_entity_1 = require("./tasklist.entity");
const user_entity_1 = require("./user.entity");
const task_enum_1 = require("../shared/enums/task.enum");
let TaskEntity = class TaskEntity extends typeorm_1.BaseEntity {
    id;
    title;
    description;
    startAt;
    dueAt;
    status;
    order;
    taskListId;
    taskList;
    assigneeId;
    assignee;
    parentId;
    parent;
    children;
    createdAt;
    updatedAt;
};
exports.TaskEntity = TaskEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TaskEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TaskEntity.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], TaskEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], TaskEntity.prototype, "startAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], TaskEntity.prototype, "dueAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: task_enum_1.TaskStatus, default: task_enum_1.TaskStatus.OPEN }),
    __metadata("design:type", String)
], TaskEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], TaskEntity.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], TaskEntity.prototype, "taskListId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tasklist_entity_1.TaskListEntity, (list) => list.tasks, { onDelete: 'CASCADE' }),
    __metadata("design:type", tasklist_entity_1.TaskListEntity)
], TaskEntity.prototype, "taskList", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], TaskEntity.prototype, "assigneeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, (user) => user.id, { nullable: true, onDelete: 'SET NULL' }),
    __metadata("design:type", user_entity_1.UserEntity)
], TaskEntity.prototype, "assignee", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], TaskEntity.prototype, "parentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => TaskEntity, (task) => task.children, { nullable: true, onDelete: 'CASCADE' }),
    __metadata("design:type", TaskEntity)
], TaskEntity.prototype, "parent", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => TaskEntity, (task) => task.parent),
    __metadata("design:type", Array)
], TaskEntity.prototype, "children", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TaskEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], TaskEntity.prototype, "updatedAt", void 0);
exports.TaskEntity = TaskEntity = __decorate([
    (0, typeorm_1.Entity)('task')
], TaskEntity);
//# sourceMappingURL=task.entity.js.map