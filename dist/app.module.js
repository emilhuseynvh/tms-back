"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const typeorm_1 = require("@nestjs/typeorm");
const database_1 = __importDefault(require("./config/database"));
const jwt_1 = require("@nestjs/jwt");
const config_1 = __importDefault(require("./config"));
const nestjs_cls_1 = require("nestjs-cls");
const user_module_1 = require("./modules/user/user.module");
const auth_module_1 = require("./modules/auth/auth.module");
const uploads_module_1 = require("./modules/uploads/uploads.module");
const path_1 = require("path");
const serve_static_1 = require("@nestjs/serve-static");
const folder_module_1 = require("./modules/folder/folder.module");
const tasklist_module_1 = require("./modules/tasklist/tasklist.module");
const task_module_1 = require("./modules/task/task.module");
const chat_module_1 = require("./modules/chat/chat.module");
const task_status_module_1 = require("./modules/task-status/task-status.module");
const activity_log_module_1 = require("./modules/activity-log/activity-log.module");
const trash_module_1 = require("./modules/trash/trash.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot(database_1.default.options),
            jwt_1.JwtModule.register({
                global: true,
                secret: config_1.default.superSecret,
                signOptions: { expiresIn: '1d' }
            }),
            nestjs_cls_1.ClsModule.forRoot({
                global: true,
                middleware: {
                    mount: true
                }
            }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, 'uploads'),
                serveRoot: '/uploads',
            }),
            user_module_1.UserModule,
            auth_module_1.AuthModule,
            uploads_module_1.UploadsModule,
            folder_module_1.FolderModule,
            tasklist_module_1.TaskListModule,
            task_status_module_1.TaskStatusModule,
            task_module_1.TaskModule,
            chat_module_1.ChatModule,
            activity_log_module_1.ActivityLogModule,
            trash_module_1.TrashModule
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map