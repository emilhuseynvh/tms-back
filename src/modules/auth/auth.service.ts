import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { Repository } from 'typeorm';
import { UserEntity } from '../../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { compare } from 'bcrypt';
import { AuthUtils } from '../../shared/utils/auth.utils'
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserEntity)
        private userRepo: Repository<UserEntity>,
        private authUtils: AuthUtils
    ) { }

    async login(params: LoginDto) {
        let user = await this.userRepo.findOne({ where: { email: params.email } })
        if (!user) throw new UnauthorizedException('Email yaxud parol səhvdir!')


        let checkPassword = await compare(params.password, user.password)

        if (!checkPassword) throw new UnauthorizedException('Email yaxud parol səhvdir!')

        let token = this.authUtils.generateToken(user.id)

        return {
            ...user,
            token: token
        }
    }

    async verifyToken(userId: number) {
        const user = await this.userRepo.findOne({
            where: { id: userId },
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
        });

        if (!user) {
            throw new UnauthorizedException('İstifadəçi tapılmadı!');
        }

        return user;
    }
}