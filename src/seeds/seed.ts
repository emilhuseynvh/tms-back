import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserService } from '../modules/user/user.service';
import { RoleEnum } from '../shared/enums/role.enum';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);

    const userService = app.get(UserService);


    const adminUser = await userService.findByEmail('admin@example.com');
    if (!adminUser) {
        await userService.createAdmin({
            username: 'Admin',
            email: 'admin@example.com',
            password: 'admin123',
            role: RoleEnum.ADMIN, 
            avatarId: 1,
            phone: 'alksndlaksnd'
        });

        console.log('Admin user yaradıldı');
    } else {
        console.log('Admin user artıq mövcuddur.');
    }

    await app.close();
}

bootstrap();
