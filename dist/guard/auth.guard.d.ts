import { CanActivate, ExecutionContext } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ClsService } from "nestjs-cls";
import { UserService } from "../modules/user/user.service";
export default class AuthGuard implements CanActivate {
    private jwtService;
    private userService;
    private clsService;
    constructor(jwtService: JwtService, userService: UserService, clsService: ClsService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
