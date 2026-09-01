import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ClsService } from "nestjs-cls";
import { UserService } from "../modules/user/user.service";

@Injectable()
export default class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private userService: UserService,
        private clsService: ClsService
    ) { }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()

        const raw =
            request.headers?.authorization ||
            request.headers?.Authorization ||
            request.headers?.AUTHORIZATION
        const authorization = Array.isArray(raw) ? raw[0] : raw

        if (!authorization || typeof authorization !== 'string') {
            throw new UnauthorizedException('Authorization header missing')
        }

        const [scheme, ...tokenParts] = authorization.trim().split(/\s+/)
        const token = tokenParts.join(' ').trim()
        if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
            throw new UnauthorizedException('Invalid Authorization header format')
        }

        let payload: Record<string, unknown>
        try {
            payload = this.jwtService.verify(token)
        } catch {
            throw new UnauthorizedException('Token etibarsızdır və ya müddəti bitib')
        }

        const userId = payload?.userId ?? payload?.sub ?? payload?.id
        if (userId == null || userId === '') {
            throw new UnauthorizedException()
        }

        const user = await this.userService.findForAuth(userId as number)
        if (!user) {
            throw new UnauthorizedException()
        }

        request.user = user
        if (this.clsService.isActive()) {
            this.clsService.set('user', user)
        }

        return true
    }
}
