import { BaseEntity } from "typeorm";
export declare class SettingsEntity extends BaseEntity {
    id: number;
    key: string;
    value: string | null;
    updatedAt: Date;
}
