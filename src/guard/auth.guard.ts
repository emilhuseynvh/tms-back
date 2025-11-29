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
        let request = context.switchToHttp().getRequest()

        console.log(request.headers?.AUTHORIZATION)
        const authorization: string | undefined =
            request.headers?.authorization ||
            request.headers?.Authorization ||
            request.headers?.AUTHORIZATION

        if (!authorization) {
            throw new UnauthorizedException('Authorization header missing')
        }

        const [scheme, token] = authorization.split(' ')
        if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
            throw new UnauthorizedException('Invalid Authorization header format')
        }
        try {
            let payload = this.jwtService.verify(token)

            if (!payload.userId) throw new UnauthorizedException()

            let user = await this.userService.getUserById(payload.userId)

            if (!user) throw new UnauthorizedException()

            this.clsService.set('user', user)

            return true
        } catch (error) {
            throw new UnauthorizedException()
        }
    }
}