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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let TelegramService = class TelegramService {
    botToken = '8555914808:AAHJVZme_NjwuZ_DDpz0KAbsiIy-HUhj5AI';
    chatId;
    constructor() {
        this.chatId = process.env.TELEGRAM_CHAT_ID || '';
    }
    async sendError(error) {
        if (!this.chatId) {
            console.warn('TELEGRAM_CHAT_ID is not set');
            return;
        }
        try {
            const timestamp = new Date().toLocaleString('az-AZ', { timeZone: 'Asia/Baku' });
            let text = `🚨 <b>ERROR</b>\n\n`;
            text += `📅 <b>Vaxt:</b> ${timestamp}\n`;
            if (error.statusCode) {
                text += `📊 <b>Status:</b> ${error.statusCode}\n`;
            }
            if (error.method && error.path) {
                text += `🔗 <b>Endpoint:</b> ${error.method} ${error.path}\n`;
            }
            if (error.userId) {
                text += `👤 <b>User ID:</b> ${error.userId}\n`;
            }
            text += `\n❌ <b>Xəta:</b>\n<code>${this.escapeHtml(error.message)}</code>\n`;
            if (error.body && Object.keys(error.body).length > 0) {
                const bodyStr = JSON.stringify(error.body, null, 2);
                if (bodyStr.length < 500) {
                    text += `\n📦 <b>Body:</b>\n<pre>${this.escapeHtml(bodyStr)}</pre>\n`;
                }
            }
            if (error.stack) {
                const shortStack = error.stack.split('\n').slice(0, 5).join('\n');
                text += `\n📚 <b>Stack:</b>\n<pre>${this.escapeHtml(shortStack)}</pre>`;
            }
            await axios_1.default.post(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
                chat_id: this.chatId,
                text: text.substring(0, 4000),
                parse_mode: 'HTML',
            });
        }
        catch (err) {
            console.error('Telegram notification failed:', err.message);
        }
    }
    escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
};
exports.TelegramService = TelegramService;
exports.TelegramService = TelegramService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], TelegramService);
//# sourceMappingURL=telegram.service.js.map