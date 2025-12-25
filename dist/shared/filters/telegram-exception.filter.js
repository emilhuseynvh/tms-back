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
exports.TelegramExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const telegram_service_1 = require("../services/telegram.service");
let TelegramExceptionFilter = class TelegramExceptionFilter {
    telegramService;
    constructor(telegramService) {
        this.telegramService = telegramService;
    }
    async catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const message = exception instanceof common_1.HttpException
            ? exception.message
            : exception instanceof Error
                ? exception.message
                : 'Internal server error';
        const stack = exception instanceof Error ? exception.stack : undefined;
        const user = request.user;
        await this.telegramService.sendError({
            message,
            stack: status >= 500 ? stack : undefined,
            path: request.url,
            method: request.method,
            statusCode: status,
            userId: user?.id,
            body: request.body,
        });
        response.status(status).json({
            statusCode: status,
            message,
            error: status >= 500 ? 'Internal Server Error' : undefined,
        });
    }
};
exports.TelegramExceptionFilter = TelegramExceptionFilter;
exports.TelegramExceptionFilter = TelegramExceptionFilter = __decorate([
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [telegram_service_1.TelegramService])
], TelegramExceptionFilter);
//# sourceMappingURL=telegram-exception.filter.js.map