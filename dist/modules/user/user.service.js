"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../entities/user.entity");
const nestjs_cls_1 = require("nestjs-cls");
const typeorm_2 = require("@nestjs/typeorm");
const bcrypt_1 = require("bcrypt");
const uploads_entity_1 = require("../../entities/uploads.entity");
const role_enum_1 = require("../../shared/enums/role.enum");
let UserService = class UserService {
    userRepo;
    uploadRepo;
    cls;
    constructor(userRepo, uploadRepo, cls) {
        this.userRepo = userRepo;
        this.uploadRepo = uploadRepo;
        this.cls = cls;
    }
    async getUserById(id) {
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
        });
    }
    async list(role, search) {
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
            }
            else {
                queryBuilder.where('(user.username ILIKE :search OR user.email ILIKE :search)', {
                    search: `%${search}%`,
                });
            }
        }
        return await queryBuilder.getMany();
    }
    async findByEmail(email) {
        return this.userRepo.findOne({ where: { email } });
    }
    async create(params) {
        let user = await this.userRepo.findOne({ where: { email: params.email } });
        if (user)
            throw new common_1.ConflictException('Əməkdaş artıq mövcuddur!');
        if (params.avatarId) {
            let avatar = await this.uploadRepo.findOne({ where: { id: params.avatarId } });
            if (!avatar)
                throw new common_1.NotFoundException('Şəkil tapılmadı!');
        }
        params.password = await (0, bcrypt_1.hash)(params.password, 10);
        user = this.userRepo.create({
            avatarId: params.avatarId ?? null,
            email: params.email,
            username: params.username,
            password: params.password,
            phone: params.phone,
            role: params.role ?? role_enum_1.RoleEnum.USER,
        });
        await user.save();
        return { message: 'Əməkdaş uğurla yaradıldı!' };
    }
    async createAdmin(params) {
        let user = await this.userRepo.findOne({ where: { email: params.email } });
        if (user)
            throw new common_1.ConflictException('Əməkdaş artıq mövcuddur!');
        if (params.avatarId) {
            let avatar = await this.uploadRepo.findOne({ where: { id: params.avatarId } });
            if (!avatar)
                throw new common_1.NotFoundException('Şəkil tapılmadı!');
        }
        params.password = await (0, bcrypt_1.hash)(params.password, 10);
        user = this.userRepo.create({
            ...params,
            avatarId: params.avatarId ?? null,
        });
        await user.save();
        return { message: 'Əməkdaş uğurla yaradıldı!' };
    }
    async update(id, params) {
        const checkedUser = await this.userRepo.findOne({ where: { id } });
        if (!checkedUser)
            throw new common_1.NotFoundException('Əməkdaş tapılmadı!');
        if (params.email && params.email !== checkedUser.email) {
            const existingUser = await this.userRepo.findOne({ where: { email: params.email } });
            if (existingUser)
                throw new common_1.ConflictException('Bu email artıq istifadə olunur!');
        }
        if (params.avatarId !== undefined) {
            if (params.avatarId === 0 || params.avatarId === null) {
                checkedUser.avatarId = null;
            }
            else {
                const avatar = await this.uploadRepo.findOne({ where: { id: params.avatarId } });
                if (!avatar)
                    throw new common_1.NotFoundException('Şəkil tapılmadı!');
                checkedUser.avatarId = params.avatarId;
            }
        }
        if (params.username !== undefined)
            checkedUser.username = params.username;
        if (params.email !== undefined)
            checkedUser.email = params.email;
        if (params.phone !== undefined)
            checkedUser.phone = params.phone;
        await checkedUser.save();
        return { message: 'Əməkdaş uğurla yeniləndi!' };
    }
    async updateMe(params) {
        const user = this.cls.get('user');
        const currentUser = await this.userRepo.findOne({ where: { id: user.id } });
        if (!currentUser)
            throw new common_1.NotFoundException('İstifadəçi tapılmadı!');
        if (params.email && params.email !== currentUser.email) {
            const existingUser = await this.userRepo.findOne({ where: { email: params.email } });
            if (existingUser)
                throw new common_1.ConflictException('Bu email artıq istifadə olunur!');
        }
        if (params.avatarId !== undefined) {
            if (params.avatarId === 0 || params.avatarId === null) {
                currentUser.avatarId = null;
            }
            else {
                const avatar = await this.uploadRepo.findOne({ where: { id: params.avatarId } });
                if (!avatar)
                    throw new common_1.NotFoundException('Şəkil tapılmadı!');
                currentUser.avatarId = params.avatarId;
            }
        }
        if (params.username !== undefined)
            currentUser.username = params.username;
        if (params.email !== undefined)
            currentUser.email = params.email;
        if (params.phone !== undefined)
            currentUser.phone = params.phone;
        await currentUser.save();
        return { message: 'Hesabınız uğurla yeniləndi!' };
    }
    async deleteUser(id) {
        let user = this.cls.get('user');
        let checkUser = await this.userRepo.findOne({ where: { id } });
        if (!checkUser)
            throw new common_1.NotFoundException('Əməkdaş tapılmadı!');
        if (user.role !== 'admin') {
            if (user.id !== id)
                throw new common_1.BadRequestException('Bu əməliyyatı yerinə yetirmək üçün icazəniz yoxdur!');
        }
        await this.userRepo.delete({ id });
        return { message: user.id == id ? 'Hesabınız uğurla silindi!' : 'Əməkdaş uğurla silindi!' };
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(user_entity_1.UserEntity)),
    __param(1, (0, typeorm_2.InjectRepository)(uploads_entity_1.UploadsEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_1.Repository !== "undefined" && typeorm_1.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_1.Repository !== "undefined" && typeorm_1.Repository) === "function" ? _b : Object, typeof (_c = typeof nestjs_cls_1.ClsService !== "undefined" && nestjs_cls_1.ClsService) === "function" ? _c : Object])
], UserService);
//# sourceMappingURL=user.service.js.map