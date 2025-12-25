import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsDateString, IsNumber, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class CreateTaskDto {
	@Type()
	@IsString()
	@ApiProperty()
	title: string

	@Type()
	@IsOptional()
	@IsString()
	@ApiProperty({ required: false })
	description?: string

	@Type()
	@IsOptional()
	@IsDateString()
	@ApiProperty({ required: false })
	startAt?: string

	@Type()
	@IsOptional()
	@IsDateString()
	@ApiProperty({ required: false })
	dueAt?: string

	@Type()
	@IsNumber()
	@ApiProperty()
	taskListId: number

	@Type(() => Number)
	@IsOptional()
	@IsArray()
	@IsNumber({}, { each: true })
	@ApiProperty({ type: [Number], required: false })
	assigneeIds?: number[]

	@Type()
	@IsOptional()
	@IsNumber()
	@ApiProperty({ required: false })
	statusId?: number

	@Type()
	@IsOptional()
	@IsNumber()
	@ApiProperty({ required: false })
	parentId?: number

	@Type()
	@IsOptional()
	@IsString()
	@ApiProperty({ required: false })
	link?: string
}
