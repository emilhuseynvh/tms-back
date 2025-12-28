import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsDateString, IsNumber, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class UpdateTaskDto {
	@IsOptional()
	@IsString()
	@ApiProperty({ required: false })
	title?: string

	@IsOptional()
	@IsString()
	@ApiProperty({ required: false })
	description?: string

	@IsOptional()
	@IsDateString()
	@ApiProperty({ required: false })
	startAt?: string

	@IsOptional()
	@IsDateString()
	@ApiProperty({ required: false })
	dueAt?: string

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@ApiProperty({ required: false })
	statusId?: number

	@IsOptional()
	@Type(() => Number)
	@IsArray()
	@IsNumber({}, { each: true })
	@ApiProperty({ type: [Number], required: false })
	assigneeIds?: number[]

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@ApiProperty({ required: false })
	taskListId?: number

	@IsOptional()
	@IsString()
	@ApiProperty({ required: false })
	link?: string
}
