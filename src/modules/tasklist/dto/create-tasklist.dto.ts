import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class CreateTaskListDto {
	@IsString()
	@ApiProperty()
	name: string

	@IsNumber()
	@ApiProperty()
	folderId: number
}

