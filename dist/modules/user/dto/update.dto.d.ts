import { RoleEnum } from "../../../shared/enums/role.enum";
export declare class UpdateUserDto {
    username?: string;
    shortName?: string;
    avatarId?: number;
    phone?: string;
    email?: string;
    password?: string;
    role?: RoleEnum;
    browserNotificationsEnabled?: boolean;
}
