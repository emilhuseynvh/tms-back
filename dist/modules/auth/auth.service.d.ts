import { LoginDto } from './dto/login.dto';
import { Repository } from 'typeorm';
import { UserEntity } from '../../entities/user.entity';
import { AuthUtils } from '../../shared/utils/auth.utils';
export declare class AuthService {
    private userRepo;
    private authUtils;
    constructor(userRepo: Repository<UserEntity>, authUtils: AuthUtils);
    login(params: LoginDto): Promise<any>;
    verifyToken(userId: number): Promise<any>;
}
