import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateTaskListDto {
	@IsString()
	@ApiProperty()
	name: string

	@IsOptional()
	@IsNumber()
	@ApiProperty({ required: false })
	folderId?: number

	@IsOptional()
	@IsNumber()
	@ApiProperty({ required: false })
	spaceId?: number
}

