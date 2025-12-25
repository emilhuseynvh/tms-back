"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const telegram_exception_filter_1 = require("./shared/filters/telegram-exception.filter");
const telegram_service_1 = require("./shared/services/telegram.service");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const telegramService = new telegram_service_1.TelegramService();
    app.useGlobalFilters(new telegram_exception_filter_1.TelegramExceptionFilter(telegramService));
    app.setGlobalPrefix('api');
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Task managment system')
        .setDescription('The TMS API')
        .setVersion('1.0')
        .addTag('task-managment')
        .addBearerAuth()
        .build();
    app.enableCors();
    const documentFactory = () => swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('', app, documentFactory, {
        swaggerOptions: {
            persistAuthorization: true,
        },
        customCssUrl: 'https://unpkg.com/swagger-ui-dist/swagger-ui.css',
        customJs: [
            'https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js',
            'https://unpkg.com/swagger-ui-dist/swagger-ui-standalone-preset.js',
        ],
        customfavIcon: 'https://unpkg.com/swagger-ui-dist/favicon-32x32.png'
    });
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'uploads'), {
        prefix: '/uploads/',
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
    }));
    swagger_1.SwaggerModule.setup('docs', app, documentFactory, { swaggerOptions: { persistAuthorization: true } });
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
//# sourceMappingURL=main.js.map