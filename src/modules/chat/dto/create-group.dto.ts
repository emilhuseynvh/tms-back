import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsNumber } from 'class-validator';

export class CreateGroupDto {
    @Type()
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    name: string;

    @Type()
    @IsString()
    @IsOptional()
    @ApiProperty()
    description?: string;

    @Type()
    @IsArray()
    @IsNumber({}, { each: true })
    @IsNotEmpty()
    @ApiProperty()
    memberIds: number[];
}

