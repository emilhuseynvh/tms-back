import { RoleEnum } from "../../../shared/enums/role.enum";
export declare class CreateUserDto {
    username: string;
    avatarId?: number;
    phone: string;
    email: string;
    password: string;
    role?: RoleEnum;
}
export declare class CreateAdminDto {
    username: string;
    avatarId?: number;
    phone: string;
    email: string;
    role: RoleEnum;
    password: string;
}
