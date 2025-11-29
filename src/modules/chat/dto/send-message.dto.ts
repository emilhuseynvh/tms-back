import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class SendMessageDto {
    @Type()
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    roomId: number;

    @Type()
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    content: string;
}

