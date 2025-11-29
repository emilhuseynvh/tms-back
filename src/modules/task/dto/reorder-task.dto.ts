import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber } from "class-validator";

export class ReorderTaskDto {
	@ApiProperty({ type: Number, example: 1 })
	@Type(() => Number)
	@IsNumber()
	taskId: number

	@ApiProperty({ type: Number, example: 0 })
	@Type(() => Number)
	@IsNumber()
	targetIndex: number
}

