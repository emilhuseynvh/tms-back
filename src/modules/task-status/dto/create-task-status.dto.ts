import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { Type } from "class-transformer";

export class CreateTaskStatusDto {
	@Type()
	@IsString()
	@ApiProperty()
	name: string
}
