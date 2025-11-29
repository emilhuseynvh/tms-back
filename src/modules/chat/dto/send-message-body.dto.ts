import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsNotEmpty } from 'class-validator';

export class SendMessageBodyDto {
    @Type()
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Mesaj mətni' })
    content: string;
}

