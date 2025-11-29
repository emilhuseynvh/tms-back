import { JwtService } from '@nestjs/jwt';
export declare class AuthUtils {
    private jwtService;
    constructor(jwtService: JwtService);
    generateToken(userId: number): any;
}
