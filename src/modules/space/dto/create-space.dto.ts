import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsInt, IsOptional, IsString } from "class-validator";

export class CreateSpaceDto {
	@Type()
	@IsString()
	@ApiProperty()
	name: string

	@Type()
	@IsOptional()
	@IsString()
	@ApiProperty({ required: false })
	description?: string

	@IsOptional()
	@IsArray()
	@IsInt({ each: true })
	@ApiProperty({ required: false, type: [Number] })
	assigneeIds?: number[]
}
