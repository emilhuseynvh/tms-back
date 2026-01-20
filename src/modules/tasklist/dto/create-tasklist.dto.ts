import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsInt, IsNumber, IsOptional, IsString } from "class-validator";

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

	@IsOptional()
	@IsArray()
	@IsInt({ each: true })
	@ApiProperty({ required: false, type: [Number] })
	assigneeIds?: number[]
}

