import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update.dto';
import { CreateUserDto } from './dto/create.dto';
import { Auth } from '../../shared/decorators/auth.decorator';
import { RoleEnum } from '../../shared/enums/role.enum';

@ApiTags('user')
@Controller('user')
export class UserController {
    constructor(
        private userService: UserService
    ) { }
    
    @Get()
    @Auth()
    @ApiOperation({ summary: 'İstifadəçiləri listləmək (filter və search ilə)' })
    @ApiQuery({ name: 'role', required: false, enum: RoleEnum, description: 'Role-a görə filter' })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Username və ya email-ə görə axtarış' })
    async getAllUsers(
        @Query('role') role?: RoleEnum,
        @Query('search') search?: string,
    ) {
        return await this.userService.list(role, search);
    }

    @Get(':id')
    @Auth()
    async getUserById(@Param('id') id: number) {
        return await this.userService.getUserById(id);
    }

    @Post()
    @ApiOperation({ summary: 'İstifadəçi yaratmaq (admin role ilə)' })
    async createUser(@Body() body: CreateUserDto) {
        return await this.userService.create(body);
    }
    
    @Post('me')
    @Auth()
    async updateMe(
        @Body() body: UpdateUserDto,
    ) {
        return await this.userService.updateMe(body);
    }

    @Post(':id')
    @Auth()
    async updateUser(
        @Param('id') id: number,
        @Body() body: UpdateUserDto,
    ) {
        return await this.userService.update(id, body);
    }



    @Delete(':id')
    @Auth(RoleEnum.ADMIN)
    async deleteUser(@Param('id') id: number) {
        return await this.userService.deleteUser(id);
    }

}