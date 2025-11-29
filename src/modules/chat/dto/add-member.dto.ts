import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsNotEmpty, IsArray } from 'class-validator';

export class AddMemberDto {
    @Type()
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    roomId: number;

    @Type()
    @IsArray()
    @IsNumber({}, { each: true })
    @IsNotEmpty()
    @ApiProperty()
    userIds: number[];
}

