import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import database from './config/database';
import { JwtModule } from '@nestjs/jwt';
import config from './config';
import { ClsModule } from 'nestjs-cls';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static'
import { FolderModule } from './modules/folder/folder.module';
import { TaskListModule } from './modules/tasklist/tasklist.module';
import { TaskModule } from './modules/task/task.module';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(database.options),
    JwtModule.register({
      global: true,
      secret: config.superSecret,
      signOptions: { expiresIn: '1d' }
    }),
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true
      }
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'uploads'),
      serveRoot: '/uploads',
    }),
    UserModule,
    AuthModule,
    UploadsModule,
    FolderModule,
    TaskListModule,
    TaskModule,
    ChatModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
