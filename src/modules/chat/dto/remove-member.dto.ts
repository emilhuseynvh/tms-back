import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class RemoveMemberDto {
    @Type()
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    roomId: number;

    @Type()
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    userId: number;
}
