import { LoginDto } from './dto/login.dto';
import { Repository } from 'typeorm';
import { UserEntity } from '../../entities/user.entity';
import { AuthUtils } from '../../shared/utils/auth.utils';
export declare class AuthService {
    private userRepo;
    private authUtils;
    constructor(userRepo: Repository<UserEntity>, authUtils: AuthUtils);
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
    verifyToken(userId: number): Promise<UserEntity>;
}
