import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { TelegramExceptionFilter } from './shared/filters/telegram-exception.filter';
import { TelegramService } from './shared/services/telegram.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Telegram error notification
  const telegramService = new TelegramService();
  app.useGlobalFilters(new TelegramExceptionFilter(telegramService));

  app.setGlobalPrefix('api')

  const config = new DocumentBuilder()
    .setTitle('Task managment system')
    .setDescription('The TMS API')
    .setVersion('1.0')
    .addTag('task-managment')
    .addBearerAuth()
    .build();

  app.enableCors()
const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('', app, documentFactory, {
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

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));
  SwaggerModule.setup('docs', app, documentFactory,
    { swaggerOptions: { persistAuthorization: true } }
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
