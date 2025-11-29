import { BaseEntity } from "typeorm";
import { RoleEnum } from "../shared/enums/role.enum";
export declare class UserEntity extends BaseEntity {
    id: number;
    username: string;
    avatarId: number | null;
    phone: string;
    email: string;
    password: string;
    role: RoleEnum;
    avatar: string;
    createdAt: Date;
}
