import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SettingsEntity } from '../../entities/settings.entity';

@Injectable()
export class SettingsService {
    constructor(
        @InjectRepository(SettingsEntity)
        private settingsRepo: Repository<SettingsEntity>,
    ) { }

    async getAll(): Promise<Record<string, string | null>> {
        const rows = await this.settingsRepo.find()
        return rows.reduce((acc, row) => {
            acc[row.key] = row.value
            return acc
        }, {} as Record<string, string | null>)
    }

    async set(key: string, value: string | null) {
        const existing = await this.settingsRepo.findOne({ where: { key } })
        if (existing) {
            existing.value = value
            await existing.save()
        } else {
            await this.settingsRepo.save({ key, value })
        }
        return { message: 'Parametr yadda saxlanıldı!' }
    }
}
