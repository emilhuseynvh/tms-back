import { SettingsService } from './settings.service';
import { SetSettingDto } from './dto/set-setting.dto';
export declare class SettingsController {
    private settingsService;
    constructor(settingsService: SettingsService);
    getAll(): Promise<Record<string, string | null>>;
    set(body: SetSettingDto): Promise<{
        message: string;
    }>;
}
