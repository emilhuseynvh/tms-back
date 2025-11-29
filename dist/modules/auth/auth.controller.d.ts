import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ClsService } from 'nestjs-cls';
export declare class AuthController {
    private authService;
    private cls;
    constructor(authService: AuthService, cls: ClsService);
    login(params: LoginDto): Promise<{
        token: string;
        id: number;
        username: string;
        avatarId: number | null;
        phone: string;
        email: string;
        password: string;
        role: import("../../shared/enums/role.enum").RoleEnum;
        avatar: string;
        createdAt: Date;
    }>;
    verifyToken(): Promise<import("../../entities/user.entity").UserEntity>;
}
