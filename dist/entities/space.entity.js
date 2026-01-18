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
exports.SpaceEntity = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const folder_entity_1 = require("./folder.entity");
const tasklist_entity_1 = require("./tasklist.entity");
let SpaceEntity = class SpaceEntity extends typeorm_1.BaseEntity {
    id;
    name;
    description;
    order;
    ownerId;
    owner;
    folders;
    taskLists;
    isArchived;
    archivedAt;
    archivedById;
    archivedBy;
    createdAt;
    updatedAt;
    deletedAt;
};
exports.SpaceEntity = SpaceEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SpaceEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SpaceEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SpaceEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], SpaceEntity.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SpaceEntity.prototype, "ownerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'ownerId' }),
    __metadata("design:type", user_entity_1.UserEntity)
], SpaceEntity.prototype, "owner", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => folder_entity_1.FolderEntity, (folder) => folder.space),
    __metadata("design:type", Array)
], SpaceEntity.prototype, "folders", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => tasklist_entity_1.TaskListEntity, (list) => list.space),
    __metadata("design:type", Array)
], SpaceEntity.prototype, "taskLists", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], SpaceEntity.prototype, "isArchived", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], SpaceEntity.prototype, "archivedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Object)
], SpaceEntity.prototype, "archivedById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'archivedById' }),
    __metadata("design:type", user_entity_1.UserEntity)
], SpaceEntity.prototype, "archivedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SpaceEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], SpaceEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], SpaceEntity.prototype, "deletedAt", void 0);
exports.SpaceEntity = SpaceEntity = __decorate([
    (0, typeorm_1.Entity)('space')
], SpaceEntity);
//# sourceMappingURL=space.entity.js.map