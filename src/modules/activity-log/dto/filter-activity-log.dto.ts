import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsNumber, IsEnum } from "class-validator";
import { Type, Transform } from "class-transformer";
import { ActivityType } from "../../../entities/activity-log.entity";

export class FilterActivityLogDto {
	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	@ApiProperty({ required: false, default: 1 })
	page?: number = 1

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	@ApiProperty({ required: false, default: 20 })
	limit?: number = 20

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	@ApiProperty({ required: false })
	userId?: number

	@IsString()
	@IsOptional()
	@ApiProperty({ required: false })
	type?: string

	@IsString()
	@IsOptional()
	@ApiProperty({ required: false })
	search?: string

	@IsString()
	@IsOptional()
	@ApiProperty({ required: false })
	startDate?: string

	@IsString()
	@IsOptional()
	@ApiProperty({ required: false })
	endDate?: string

	@Type(() => Number)
	@IsNumber()
	@IsOptional()
	@ApiProperty({ required: false, description: 'Tapşırıq status dəyişikliyi ilə bağlı loglar (changes.statusId)' })
	statusId?: number
}
