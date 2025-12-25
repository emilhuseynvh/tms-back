"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const user_service_1 = require("../modules/user/user.service");
const role_enum_1 = require("../shared/enums/role.enum");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const userService = app.get(user_service_1.UserService);
    const adminUser = await userService.findByEmail('admin@example.com');
    if (!adminUser) {
        await userService.createAdmin({
            username: 'Admin',
            email: 'admin@example.com',
            password: 'admin123',
            role: role_enum_1.RoleEnum.ADMIN,
            avatarId: 1,
            phone: 'alksndlaksnd'
        });
        console.log('Admin user yaradıldı');
    }
    else {
        console.log('Admin user artıq mövcuddur.');
    }
    await app.close();
}
bootstrap();
//# sourceMappingURL=seed.js.map