import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { TaskStatus } from "../../../shared/enums/task.enum";
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

	@Type()
	@IsOptional()
	@IsNumber()
	@ApiProperty({ required: false })
	assigneeId?: number

	@Type()
	@IsOptional()
	@IsEnum(TaskStatus)
	@ApiProperty({ enum: TaskStatus, required: false })
	status?: TaskStatus

	@Type()
	@IsOptional()
	@IsNumber()
	@ApiProperty({ required: false })
	parentId?: number
}

