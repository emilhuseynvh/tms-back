import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsNotEmpty, IsBoolean } from 'class-validator';

export class SetAdminDto {
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

    @Type()
    @IsBoolean()
    @ApiProperty()
    isAdmin: boolean;
}
