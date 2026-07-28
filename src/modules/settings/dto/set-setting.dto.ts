import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SetSettingDto {
    @Type()
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    key: string;

    @Type()
    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    value?: string;
}
