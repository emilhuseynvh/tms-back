import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsString } from "class-validator";

export class UpdateSpaceDto {
	@Type()
	@IsOptional()
	@IsString()
	@ApiProperty({ required: false })
	name?: string

	@Type()
	@IsOptional()
	@IsString()
	@ApiProperty({ required: false })
	description?: string
}
