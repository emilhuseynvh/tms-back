import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ClsService } from 'nestjs-cls';
export declare class AuthController {
    private authService;
    private cls;
    constructor(authService: AuthService, cls: ClsService);
    login(params: LoginDto): Promise<any>;
    verifyToken(): Promise<any>;
}
