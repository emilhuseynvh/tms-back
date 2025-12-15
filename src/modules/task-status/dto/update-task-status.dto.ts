import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class UpdateTaskStatusDto {
	@Type()
	@IsOptional()
	@IsString()
	@ApiProperty({ required: false })
	name?: string
}
