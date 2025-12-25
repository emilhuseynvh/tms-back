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

	@IsEnum(ActivityType)
	@IsOptional()
	@ApiProperty({ required: false, enum: ActivityType })
	type?: ActivityType

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
}
