import { CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ClsService } from "nestjs-cls";
export declare class RoleGuard implements CanActivate {
    private cls;
    private reflector;
    constructor(cls: ClsService, reflector: Reflector);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
