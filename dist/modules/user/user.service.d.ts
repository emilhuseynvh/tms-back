import { CreateAdminDto, CreateUserDto } from './dto/create.dto';
import { Repository } from 'typeorm';
import { UserEntity } from '../../entities/user.entity';
import { UpdateUserDto } from './dto/update.dto';
import { ClsService } from 'nestjs-cls';
import { UploadsEntity } from '../../entities/uploads.entity';
import { RoleEnum } from '../../shared/enums/role.enum';
export declare class UserService {
    private userRepo;
    private uploadRepo;
    private cls;
    constructor(userRepo: Repository<UserEntity>, uploadRepo: Repository<UploadsEntity>, cls: ClsService);
    getUserById(id: number): Promise<UserEntity | null>;
    list(role?: RoleEnum, search?: string): Promise<UserEntity[]>;
    findByEmail(email: string): Promise<UserEntity | null>;
    create(params: CreateUserDto): Promise<{
        message: string;
    }>;
    createAdmin(params: CreateAdminDto): Promise<{
        message: string;
    }>;
    update(id: number, params: UpdateUserDto): Promise<{
        message: string;
    }>;
    updateMe(params: UpdateUserDto): Promise<{
        message: string;
    }>;
    deleteUser(id: number): Promise<{
        message: string;
    }>;
}
