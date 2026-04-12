import { RoleEnum } from "../../../shared/enums/role.enum";
export declare class UpdateUserDto {
    username?: string;
    avatarId?: number;
    phone?: string;
    email?: string;
    password?: string;
    role?: RoleEnum;
}
