import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { TaskStatus } from "../../../shared/enums/task.enum";
import { Type } from "class-transformer";

export class UpdateTaskDto {
	@Type()
	@IsOptional()
	@IsString()
	@ApiProperty({ required: false })
	title?: string

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
	@IsBoolean()
	@ApiProperty({ required: false })
	is_message_send?: false

	@Type()
	@IsOptional()
	@IsEnum(TaskStatus)
	@ApiProperty({ enum: TaskStatus, required: false })
	status?: TaskStatus

	@Type()
	@IsOptional()
	@IsNumber()
	@ApiProperty({ required: false })
	assigneeId?: number

	@Type()
	@IsOptional()
	@IsNumber()
	@ApiProperty({ required: false })
	taskListId?: number
}

