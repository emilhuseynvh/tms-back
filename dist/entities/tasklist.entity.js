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
exports.TaskListEntity = void 0;
const typeorm_1 = require("typeorm");
const folder_entity_1 = require("./folder.entity");
const task_entity_1 = require("./task.entity");
const space_entity_1 = require("./space.entity");
let TaskListEntity = class TaskListEntity extends typeorm_1.BaseEntity {
    id;
    name;
    folderId;
    folder;
    spaceId;
    space;
    tasks;
    createdAt;
    updatedAt;
    deletedAt;
};
exports.TaskListEntity = TaskListEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TaskListEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TaskListEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Object)
], TaskListEntity.prototype, "folderId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => folder_entity_1.FolderEntity, (folder) => folder.taskLists, { onDelete: 'CASCADE', nullable: true }),
    __metadata("design:type", folder_entity_1.FolderEntity)
], TaskListEntity.prototype, "folder", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Object)
], TaskListEntity.prototype, "spaceId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => space_entity_1.SpaceEntity, (space) => space.taskLists, { onDelete: 'CASCADE', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'spaceId' }),
    __metadata("design:type", space_entity_1.SpaceEntity)
], TaskListEntity.prototype, "space", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => task_entity_1.TaskEntity, (task) => task.taskList),
    __metadata("design:type", Array)
], TaskListEntity.prototype, "tasks", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TaskListEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], TaskListEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], TaskListEntity.prototype, "deletedAt", void 0);
exports.TaskListEntity = TaskListEntity = __decorate([
    (0, typeorm_1.Entity)('task_list')
], TaskListEntity);
//# sourceMappingURL=tasklist.entity.js.map