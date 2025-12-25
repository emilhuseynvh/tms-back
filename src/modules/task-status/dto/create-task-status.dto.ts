import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class CreateTaskStatusDto {
	@Type()
	@IsString()
	@ApiProperty()
	name: string

	@Type()
	@IsString()
	@IsOptional()
	@ApiProperty({ required: false, default: '#3B82F6' })
	color?: string

	@Type()
	@IsString()
	@IsOptional()
	@ApiProperty({ required: false, default: 'circle' })
	icon?: string
}
