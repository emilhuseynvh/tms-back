"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArchiveModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const space_entity_1 = require("../../entities/space.entity");
const folder_entity_1 = require("../../entities/folder.entity");
const tasklist_entity_1 = require("../../entities/tasklist.entity");
const task_entity_1 = require("../../entities/task.entity");
const archive_service_1 = require("./archive.service");
const archive_controller_1 = require("./archive.controller");
let ArchiveModule = class ArchiveModule {
};
exports.ArchiveModule = ArchiveModule;
exports.ArchiveModule = ArchiveModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([space_entity_1.SpaceEntity, folder_entity_1.FolderEntity, tasklist_entity_1.TaskListEntity, task_entity_1.TaskEntity])
        ],
        controllers: [archive_controller_1.ArchiveController],
        providers: [archive_service_1.ArchiveService],
        exports: [archive_service_1.ArchiveService]
    })
], ArchiveModule);
//# sourceMappingURL=archive.module.js.map