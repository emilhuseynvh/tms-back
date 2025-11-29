import { SetMetadata } from "@nestjs/common";

export const Role = (...roles: string[]) => {
    return SetMetadata('roles', roles)
}