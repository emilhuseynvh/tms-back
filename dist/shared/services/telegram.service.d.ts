export declare class TelegramService {
    private readonly botToken;
    private readonly chatId;
    constructor();
    sendError(error: {
        message: string;
        stack?: string;
        path?: string;
        method?: string;
        statusCode?: number;
        userId?: number;
        body?: any;
    }): Promise<void>;
    sendMessage(text: string): Promise<void>;
    private escapeHtml;
}
