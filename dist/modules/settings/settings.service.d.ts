import { Repository } from 'typeorm';
import { SettingsEntity } from '../../entities/settings.entity';
export declare class SettingsService {
    private settingsRepo;
    constructor(settingsRepo: Repository<SettingsEntity>);
    getAll(): Promise<Record<string, string | null>>;
    set(key: string, value: string | null): Promise<{
        message: string;
    }>;
}
