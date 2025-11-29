import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAdminDto, CreateUserDto } from './dto/create.dto';
import { Repository } from 'typeorm';
import { UserEntity } from '../../entities/user.entity';
import { UpdateUserDto } from './dto/update.dto';
import { ClsService } from 'nestjs-cls';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcrypt';
import { UploadsEntity } from '../../entities/uploads.entity';
import { RoleEnum } from '../../shared/enums/role.enum';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private userRepo: Repository<UserEntity>,
        @InjectRepository(UploadsEntity)
        private uploadRepo: Repository<UploadsEntity>,
        private cls: ClsService
    ) { }


    async getUserById(id: number) {
        return await this.userRepo.findOne({
            where: { id },
            relations: ['avatar'],
            select: {
                id: true,
                username: true,
                avatar: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true,
            }
        })
    }

    async list(role?: RoleEnum, search?: string) {
        const queryBuilder = this.userRepo
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.avatar', 'avatar');

        if (role) {
            queryBuilder.where('user.role = :role', { role });
        }

        if (search) {
            if (role) {
                queryBuilder.andWhere('(user.username ILIKE :search OR user.email ILIKE :search)', {
                    search: `%${search}%`,
                });
            } else {
                queryBuilder.where('(user.username ILIKE :search OR user.email ILIKE :search)', {
                    search: `%${search}%`,
                });
            }
        }

        return await queryBuilder.getMany();
    }

    async findByEmail(email: string) {
        return this.userRepo.findOne({ where: { email } });
    }


    async create(params: CreateUserDto) {
        let user = await this.userRepo.findOne({ where: { email: params.email } })

        if (user) throw new ConflictException('Əməkdaş artıq mövcuddur!')

        if (params.avatarId) {
            let avatar = await this.uploadRepo.findOne({ where: { id: params.avatarId } })

            if (!avatar) throw new NotFoundException('Şəkil tapılmadı!')
        }

        params.password = await hash(params.password, 10)

        user = this.userRepo.create({
            avatarId: params.avatarId ?? null,
            email: params.email,
            username: params.username,
            password: params.password,
            phone: params.phone,
            role: params.role ?? RoleEnum.USER,
        })

        await user.save()

        return { message: 'Əməkdaş uğurla yaradıldı!' }
    }

    async createAdmin(params: CreateAdminDto) {
        let user = await this.userRepo.findOne({ where: { email: params.email } })

        if (user) throw new ConflictException('Əməkdaş artıq mövcuddur!')

        if (params.avatarId) {
            let avatar = await this.uploadRepo.findOne({ where: { id: params.avatarId } })

            if (!avatar) throw new NotFoundException('Şəkil tapılmadı!')
        }

        params.password = await hash(params.password, 10)

        user = this.userRepo.create({
            ...params,
            avatarId: params.avatarId ?? null,
        })

        await user.save()

        return { message: 'Əməkdaş uğurla yaradıldı!' }
    }



    async update(id: number, params: UpdateUserDto) {
        const checkedUser = await this.userRepo.findOne({ where: { id } })

        if (!checkedUser) throw new NotFoundException('Əməkdaş tapılmadı!')

        // Check for duplicate email if email is being changed
        if (params.email && params.email !== checkedUser.email) {
            const existingUser = await this.userRepo.findOne({ where: { email: params.email } })
            if (existingUser) throw new ConflictException('Bu email artıq istifadə olunur!')
        }

        // Handle avatarId: 0 means remove avatar, positive number means set avatar
        if (params.avatarId !== undefined) {
            if (params.avatarId === 0 || params.avatarId === null) {
                checkedUser.avatarId = null
            } else {
                const avatar = await this.uploadRepo.findOne({ where: { id: params.avatarId } })
                if (!avatar) throw new NotFoundException('Şəkil tapılmadı!')
                checkedUser.avatarId = params.avatarId
            }
        }

        // Only update the fields that are provided
        if (params.username !== undefined) checkedUser.username = params.username
        if (params.email !== undefined) checkedUser.email = params.email
        if (params.phone !== undefined) checkedUser.phone = params.phone

        await checkedUser.save()
        return { message: 'Əməkdaş uğurla yeniləndi!' }
    }

    async updateMe(params: UpdateUserDto) {
        const user = this.cls.get('user')

        // Reload user from database to ensure we have the latest data
        const currentUser = await this.userRepo.findOne({ where: { id: user.id } })
        if (!currentUser) throw new NotFoundException('İstifadəçi tapılmadı!')

        // Check for duplicate email if email is being changed
        if (params.email && params.email !== currentUser.email) {
            const existingUser = await this.userRepo.findOne({ where: { email: params.email } })
            if (existingUser) throw new ConflictException('Bu email artıq istifadə olunur!')
        }

        // Handle avatarId: 0 means remove avatar, positive number means set avatar
        if (params.avatarId !== undefined) {
            if (params.avatarId === 0 || params.avatarId === null) {
                currentUser.avatarId = null
            } else {
                const avatar = await this.uploadRepo.findOne({ where: { id: params.avatarId } })
                if (!avatar) throw new NotFoundException('Şəkil tapılmadı!')
                currentUser.avatarId = params.avatarId
            }
        }

        // Only update the fields that are provided
        if (params.username !== undefined) currentUser.username = params.username
        if (params.email !== undefined) currentUser.email = params.email
        if (params.phone !== undefined) currentUser.phone = params.phone

        await currentUser.save()
        return { message: 'Hesabınız uğurla yeniləndi!' }
    }

    async deleteUser(id: number) {
        let user = this.cls.get('user')

        let checkUser = await this.userRepo.findOne({ where: { id } })

        if (!checkUser) throw new NotFoundException('Əməkdaş tapılmadı!')

        if (user.role !== 'admin') {
            if (user.id !== id) throw new BadRequestException('Bu əməliyyatı yerinə yetirmək üçün icazəniz yoxdur!')
        }

        await this.userRepo.delete({ id })
       
        return { message: user.id == id ? 'Hesabınız uğurla silindi!' : 'Əməkdaş uğurla silindi!' }
    }
}