import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsString, IsOptional } from "class-validator";

export class UpdateUserDto {
    @Type()
    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    username?: string

    @Type()
    @IsNumber()
    @IsOptional()
    @ApiProperty({ required: false })
    avatarId?: number

    @Type()
    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    phone?: string

    @Type()
    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    email?: string
}