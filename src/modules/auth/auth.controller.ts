import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Auth } from '../../shared/decorators/auth.decorator';
import { ClsService } from 'nestjs-cls';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private cls: ClsService
    ) { }

    @Post('login')
    @ApiOperation({ summary: 'Login olmaq' })
    async login(@Body() params: LoginDto) {
        return await this.authService.login(params)
    }

    @Get('verify')
    @Auth()
    @ApiOperation({ summary: 'Token yoxlamaq' })
    async verifyToken() {
        const user = this.cls.get('user');
        return await this.authService.verifyToken(user.id);
    }
}