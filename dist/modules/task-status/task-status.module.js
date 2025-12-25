"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskStatusModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const task_status_entity_1 = require("../../entities/task-status.entity");
const task_status_service_1 = require("./task-status.service");
const task_status_controller_1 = require("./task-status.controller");
let TaskStatusModule = class TaskStatusModule {
};
exports.TaskStatusModule = TaskStatusModule;
exports.TaskStatusModule = TaskStatusModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([task_status_entity_1.TaskStatusEntity])],
        controllers: [task_status_controller_1.TaskStatusController],
        providers: [task_status_service_1.TaskStatusService],
        exports: [task_status_service_1.TaskStatusService]
    })
], TaskStatusModule);
;
//# sourceMappingURL=task-status.module.js.map