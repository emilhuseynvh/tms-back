import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsNumber, IsOptional, ValidateIf } from "class-validator";

export class ReorderTaskDto {
	@ApiProperty({ type: Number, example: 1 })
	@Type(() => Number)
	@IsNumber()
	taskId: number

	@ApiProperty({ type: Number, example: 0, description: 'Yeni sıra (eyni parent altındakı qardaşlar arasında, 0-dan)' })
	@Type(() => Number)
	@IsNumber()
	targetIndex: number

	@ApiProperty({ required: false, nullable: true, description: 'Yeni parent. null = kök tapşırıq' })
	@IsOptional()
	@Transform(({ value }) => {
		if (value === null || value === undefined || value === '') return value === '' ? undefined : value
		return Number(value)
	})
	@ValidateIf((_, v) => v !== null && v !== undefined)
	@IsNumber()
	parentId?: number | null
}
