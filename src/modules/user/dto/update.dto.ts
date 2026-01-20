import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsString, IsOptional, IsEnum } from "class-validator";
import { RoleEnum } from "../../../shared/enums/role.enum";

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

    @Type()
    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    password?: string

    @Type()
    @IsEnum(RoleEnum)
    @IsOptional()
    @ApiProperty({ required: false, enum: RoleEnum })
    role?: RoleEnum
}