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
exports.FolderEntity = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const tasklist_entity_1 = require("./tasklist.entity");
const space_entity_1 = require("./space.entity");
let FolderEntity = class FolderEntity extends typeorm_1.BaseEntity {
    id;
    name;
    description;
    order;
    ownerId;
    owner;
    spaceId;
    space;
    taskLists;
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
exports.FolderEntity = FolderEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], FolderEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], FolderEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], FolderEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], FolderEntity.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], FolderEntity.prototype, "ownerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, (user) => user.id, { onDelete: 'CASCADE' }),
    __metadata("design:type", user_entity_1.UserEntity)
], FolderEntity.prototype, "owner", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], FolderEntity.prototype, "spaceId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => space_entity_1.SpaceEntity, (space) => space.folders, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'spaceId' }),
    __metadata("design:type", space_entity_1.SpaceEntity)
], FolderEntity.prototype, "space", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => tasklist_entity_1.TaskListEntity, (list) => list.folder),
    __metadata("design:type", Array)
], FolderEntity.prototype, "taskLists", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], FolderEntity.prototype, "isArchived", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], FolderEntity.prototype, "archivedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Object)
], FolderEntity.prototype, "archivedById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'archivedById' }),
    __metadata("design:type", user_entity_1.UserEntity)
], FolderEntity.prototype, "archivedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], FolderEntity.prototype, "deletedById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'deletedById' }),
    __metadata("design:type", user_entity_1.UserEntity)
], FolderEntity.prototype, "deletedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], FolderEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], FolderEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)(),
    __metadata("design:type", Date)
], FolderEntity.prototype, "deletedAt", void 0);
exports.FolderEntity = FolderEntity = __decorate([
    (0, typeorm_1.Entity)('folder')
], FolderEntity);
//# sourceMappingURL=folder.entity.js.map