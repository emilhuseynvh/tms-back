import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
	HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { TelegramService } from '../services/telegram.service';

@Catch()
export class TelegramExceptionFilter implements ExceptionFilter {
	constructor(private readonly telegramService: TelegramService) {}

	async catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();

		const status =
			exception instanceof HttpException
				? exception.getStatus()
				: HttpStatus.INTERNAL_SERVER_ERROR;

		const message =
			exception instanceof HttpException
				? exception.message
				: exception instanceof Error
				? exception.message
				: 'Internal server error';

		const stack = exception instanceof Error ? exception.stack : undefined;

		// Bütün xətaları Telegram-a göndər
		const user = (request as any).user;

		await this.telegramService.sendError({
			message,
			stack: status >= 500 ? stack : undefined, // Stack yalnız 500+ üçün
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
}
