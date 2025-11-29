import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsString, IsOptional } from "class-validator";
import { RoleEnum } from "../../../shared/enums/role.enum";

export class CreateUserDto {
    @Type()
    @IsString()
    @ApiProperty()
    username: string

    @Type()
    @IsNumber()
    @IsOptional()
    @ApiProperty({ required: false })
    avatarId?: number

    @Type()
    @IsString()
    @ApiProperty()
    phone: string

    @Type()
    @IsString()
    @ApiProperty()
    email: string

    @Type()
    @IsString()
    @ApiProperty()
    password: string

    @Type()
    @IsString()
    @IsOptional()
    @ApiProperty({ enum: RoleEnum, required: false, default: RoleEnum.USER })
    role?: RoleEnum
}

export class CreateAdminDto {
    @Type()
    @IsString()
    @ApiProperty()
    username: string

    @Type()
    @IsNumber()
    @IsOptional()
    @ApiProperty({ required: false })
    avatarId?: number

    @Type()
    @IsString()
    @ApiProperty()
    phone: string

    @Type()
    @IsString()
    @ApiProperty()
    email: string

    @Type()
    @IsString()
    @ApiProperty({ enum: RoleEnum })
    role: RoleEnum

    @Type()
    @IsString()
    @ApiProperty()
    password: string
}