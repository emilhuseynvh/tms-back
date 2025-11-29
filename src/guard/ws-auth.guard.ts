import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../modules/user/user.service';

@Injectable()
export class WsAuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private userService: UserService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client = context.switchToWs().getClient();
        const token = this.extractTokenFromHeader(client.handshake);

        if (!token) {
            throw new UnauthorizedException('Token tapılmadı!');
        }

        try {
            const payload = this.jwtService.verify(token);
            if (!payload.userId) {
                throw new UnauthorizedException();
            }

            const user = await this.userService.getUserById(payload.userId);
            if (!user) {
                throw new UnauthorizedException();
            }

            // Attach user to client data
            client.data.user = user;
            return true;
        } catch (error) {
            throw new UnauthorizedException('Token etibarsızdır!');
        }
    }

    private extractTokenFromHeader(handshake: any): string | undefined {
        // Try to get token from Authorization header
        const authHeader = handshake?.headers?.authorization || handshake?.headers?.Authorization;
        if (authHeader) {
            const [scheme, token] = authHeader.split(' ');
            if (scheme?.toLowerCase() === 'bearer' && token) {
                return token;
            }
        }

        // Try to get token from query parameter
        const tokenFromQuery = handshake?.query?.token || handshake?.auth?.token;
        if (tokenFromQuery) {
            return tokenFromQuery;
        }

        return undefined;
    }
}

