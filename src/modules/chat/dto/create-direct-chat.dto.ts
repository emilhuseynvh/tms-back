import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreateDirectChatDto {
    @Type()
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    userId: number;
}

