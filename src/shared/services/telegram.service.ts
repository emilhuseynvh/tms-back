import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TelegramService {
	private readonly botToken = '8555914808:AAHJVZme_NjwuZ_DDpz0KAbsiIy-HUhj5AI';
	private readonly chatId: string;

	constructor() {
		this.chatId = process.env.TELEGRAM_CHAT_ID || '';
	}

	async sendError(error: {
		message: string;
		stack?: string;
		path?: string;
		method?: string;
		statusCode?: number;
		userId?: number;
		body?: any;
	}) {
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

			await axios.post(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
				chat_id: this.chatId,
				text: text.substring(0, 4000),
				parse_mode: 'HTML',
			});
		} catch (err) {
			console.error('Telegram notification failed:', err.message);
		}
	}

	private escapeHtml(text: string): string {
		return text
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
	}
}
