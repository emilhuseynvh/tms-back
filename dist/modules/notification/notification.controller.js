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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = __importDefault(require("../../guard/auth.guard"));
const role_guard_1 = require("../../guard/role.guard");
const role_decorator_1 = require("../../shared/decorators/role.decorator");
const role_enum_1 = require("../../shared/enums/role.enum");
const notification_service_1 = require("./notification.service");
const update_settings_dto_1 = require("./dto/update-settings.dto");
const nestjs_cls_1 = require("nestjs-cls");
let NotificationController = class NotificationController {
    notificationService;
    cls;
    constructor(notificationService, cls) {
        this.notificationService = notificationService;
        this.cls = cls;
    }
    async getMyNotifications(filter = 'all', page = '1', limit = '20') {
        const user = this.cls.get('user');
        return await this.notificationService.getUserNotifications(user.id, filter, parseInt(page), parseInt(limit));
    }
    async getUnreadCount() {
        const user = this.cls.get('user');
        return { count: await this.notificationService.getUnreadCount(user.id) };
    }
    async markAsRead(id) {
        const user = this.cls.get('user');
        const notification = await this.notificationService.markNotificationAsRead(parseInt(id), user.id);
        return { success: !!notification, notification };
    }
    async markAllAsRead() {
        const user = this.cls.get('user');
        await this.notificationService.markAllAsRead(user.id);
        return { success: true };
    }
    async deleteNotification(id) {
        const user = this.cls.get('user');
        const deleted = await this.notificationService.deleteNotification(parseInt(id), user.id);
        return { success: deleted };
    }
    async clearAll() {
        const user = this.cls.get('user');
        await this.notificationService.clearAllNotifications(user.id);
        return { success: true };
    }
    async getSettings() {
        return await this.notificationService.getSettings();
    }
    async updateSettings(dto) {
        return await this.notificationService.updateSettings(dto);
    }
};
exports.NotificationController = NotificationController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiQuery)({ name: 'filter', required: false, enum: ['all', 'unread', 'read'] }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Query)('filter')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getMyNotifications", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Put)(':id/read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Put)('read-all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markAllAsRead", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "deleteNotification", null);
__decorate([
    (0, common_1.Delete)('clear/all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "clearAll", null);
__decorate([
    (0, common_1.Get)('settings'),
    (0, common_1.UseGuards)(role_guard_1.RoleGuard),
    (0, role_decorator_1.Role)(role_enum_1.RoleEnum.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Put)('settings'),
    (0, common_1.UseGuards)(role_guard_1.RoleGuard),
    (0, role_decorator_1.Role)(role_enum_1.RoleEnum.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_settings_dto_1.UpdateNotificationSettingsDto]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "updateSettings", null);
exports.NotificationController = NotificationController = __decorate([
    (0, swagger_1.ApiTags)('Notifications'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('notifications'),
    (0, common_1.UseGuards)(auth_guard_1.default),
    __metadata("design:paramtypes", [notification_service_1.NotificationService,
        nestjs_cls_1.ClsService])
], NotificationController);
//# sourceMappingURL=notification.controller.js.map