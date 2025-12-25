import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { TelegramService } from '../services/telegram.service';
export declare class TelegramExceptionFilter implements ExceptionFilter {
    private readonly telegramService;
    constructor(telegramService: TelegramService);
    catch(exception: unknown, host: ArgumentsHost): Promise<void>;
}
