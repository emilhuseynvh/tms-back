import { BaseEntity } from "typeorm";
export declare class NotificationSettingsEntity extends BaseEntity {
    id: number;
    hoursBeforeDue: number;
    isEnabled: boolean;
    updatedAt: Date;
}
