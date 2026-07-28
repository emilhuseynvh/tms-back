import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SendTaskNotificationDto {
	@Type()
	@IsNumber()
	@IsNotEmpty()
	@ApiProperty()
	taskId: number;

	@IsArray()
	@IsInt({ each: true })
	@IsNotEmpty()
	@ApiProperty({ type: [Number] })
	userIds: number[];

	@Type()
	@IsString()
	@IsNotEmpty()
	@ApiProperty()
	message: string;
}
