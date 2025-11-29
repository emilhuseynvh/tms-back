import { applyDecorators, UseGuards } from "@nestjs/common"
import { ApiBearerAuth } from "@nestjs/swagger"
import AuthGuard from "../../guard/auth.guard"
import { Role } from "./role.decorator"
import { RoleGuard } from "../../guard/role.guard"

export const Auth = (...roles: string[]) => {
    return applyDecorators(
        UseGuards(AuthGuard, RoleGuard),
        Role(...roles),
        ApiBearerAuth()
    )
}