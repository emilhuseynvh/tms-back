import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update.dto';
import { CreateUserDto } from './dto/create.dto';
import { RoleEnum } from '../../shared/enums/role.enum';
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    getAllUsers(role?: RoleEnum, search?: string): Promise<import("../../entities/user.entity").UserEntity[]>;
    getUserById(id: number): Promise<import("../../entities/user.entity").UserEntity | null>;
    createUser(body: CreateUserDto): Promise<{
        message: string;
    }>;
    updateMe(body: UpdateUserDto): Promise<{
        message: string;
    }>;
    updateUser(id: number, body: UpdateUserDto): Promise<{
        message: string;
    }>;
    deleteUser(id: number): Promise<{
        message: string;
    }>;
}
