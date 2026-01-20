import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsInt, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateFolderDto {
	@Type()
	@IsString()
	@ApiProperty()
	name: string

	@Type()
	@IsOptional()
	@IsString()
	@ApiProperty({ required: false })
	description?: string

	@Type()
	@IsNumber()
	@ApiProperty()
	spaceId: number

	@IsOptional()
	@IsArray()
	@IsInt({ each: true })
	@ApiProperty({ required: false, type: [Number] })
	assigneeIds?: number[]
}

