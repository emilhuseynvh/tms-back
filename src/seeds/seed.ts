import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserService } from '../modules/user/user.service';
import { RoleEnum } from '../shared/enums/role.enum';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);

    const userService = app.get(UserService);


    const adminUser = await userService.findByEmail('admin@admin.com');
    if (!adminUser) {
        await userService.createAdmin({
            username: 'Admin',
            email: 'admin@admin.com',
            password: 'secret',
            role: RoleEnum.ADMIN,
            avatarId: undefined,
            phone: ''
        });

        console.log('Admin user yaradıldı');
    } else {
        console.log('Admin user artıq mövcuddur.');
    }

    await app.close();
}

bootstrap();
