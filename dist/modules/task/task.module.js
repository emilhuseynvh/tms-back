"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const task_entity_1 = require("../../entities/task.entity");
const task_status_entity_1 = require("../../entities/task-status.entity");
const task_activity_entity_1 = require("../../entities/task-activity.entity");
const task_service_1 = require("./task.service");
const task_controller_1 = require("./task.controller");
const activity_log_module_1 = require("../activity-log/activity-log.module");
const notification_module_1 = require("../notification/notification.module");
let TaskModule = class TaskModule {
};
exports.TaskModule = TaskModule;
exports.TaskModule = TaskModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([task_entity_1.TaskEntity, task_status_entity_1.TaskStatusEntity, task_activity_entity_1.TaskActivityEntity]),
            activity_log_module_1.ActivityLogModule,
            (0, common_1.forwardRef)(() => notification_module_1.NotificationModule)
        ],
        controllers: [task_controller_1.TaskController],
        providers: [task_service_1.TaskService],
        exports: [task_service_1.TaskService]
    })
], TaskModule);
;
//# sourceMappingURL=task.module.js.map