import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsString } from "class-validator";

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
}

