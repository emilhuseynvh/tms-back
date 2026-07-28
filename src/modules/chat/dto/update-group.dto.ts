import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';

export class UpdateGroupDto {
    @Type()
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    roomId: number;

    @Type()
    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    name?: string;

    @Type()
    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    description?: string;

    @Type()
    @IsNumber()
    @IsOptional()
    @ApiProperty({ required: false, description: '0 → şəkli sil' })
    avatarId?: number;
}
