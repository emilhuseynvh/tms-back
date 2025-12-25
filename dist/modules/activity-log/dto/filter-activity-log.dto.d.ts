import { ActivityType } from "../../../entities/activity-log.entity";
export declare class FilterActivityLogDto {
    page?: number;
    limit?: number;
    userId?: number;
    type?: ActivityType;
    search?: string;
    startDate?: string;
    endDate?: string;
}
