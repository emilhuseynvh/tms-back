import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { SetSettingDto } from './dto/set-setting.dto';
import { Auth } from '../../shared/decorators/auth.decorator';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
    constructor(private settingsService: SettingsService) { }

    @Get()
    @Auth()
    @ApiOperation({ summary: 'Bütün parametrləri almaq' })
    async getAll() {
        return await this.settingsService.getAll();
    }

    @Post()
    @Auth('admin')
    @ApiOperation({ summary: 'Parametri dəyişmək (yalnız admin)' })
    async set(@Body() body: SetSettingDto) {
        return await this.settingsService.set(body.key, body.value ?? null);
    }
}
