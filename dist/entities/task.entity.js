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
const task_status_entity_1 = require("./task-status.entity");
let TaskEntity = class TaskEntity extends typeorm_1.BaseEntity {
    id;
    title;
    description;
    startAt;
    dueAt;
    statusId;
    status;
    order;
    taskListId;
    link;
    doc;
    meetingNotes;
    taskList;
    parentId;
    parent;
    children;
    assignees;
    isArchived;
    archivedAt;
    archivedById;
    archivedBy;
    deletedById;
    deletedBy;
    createdAt;
    updatedAt;
    deletedAt;
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
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], TaskEntity.prototype, "startAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], TaskEntity.prototype, "dueAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], TaskEntity.prototype, "statusId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => task_status_entity_1.TaskStatusEntity, (status) => status.tasks, { nullable: true, onDelete: 'SET NULL', eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'statusId' }),
    __metadata("design:type", task_status_entity_1.TaskStatusEntity)
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
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], TaskEntity.prototype, "link", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], TaskEntity.prototype, "doc", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], TaskEntity.prototype, "meetingNotes", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tasklist_entity_1.TaskListEntity, (list) => list.tasks, { onDelete: 'CASCADE' }),
    __metadata("design:type", tasklist_entity_1.TaskListEntity)
], TaskEntity.prototype, "taskList", void 0);
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
    (0, typeorm_1.ManyToMany)(() => user_entity_1.UserEntity, { eager: true }),
    (0, typeorm_1.JoinTable)({
        name: 'task_assignees',
        joinColumn: { name: 'taskId' },
        inverseJoinColumn: { name: 'userId' }
    }),
    __metadata("design:type", Array)
], TaskEntity.prototype, "assignees", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], TaskEntity.prototype, "isArchived", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], TaskEntity.prototype, "archivedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Object)
], TaskEntity.prototype, "archivedById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'archivedById' }),
    __metadata("design:type", user_entity_1.UserEntity)
], TaskEntity.prototype, "archivedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], TaskEntity.prototype, "deletedById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'deletedById' }),
    __metadata("design:type", user_entity_1.UserEntity)
], TaskEntity.prototype, "deletedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], TaskEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], TaskEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], TaskEntity.prototype, "deletedAt", void 0);
exports.TaskEntity = TaskEntity = __decorate([
    (0, typeorm_1.Entity)('task')
], TaskEntity);
//# sourceMappingURL=task.entity.js.map