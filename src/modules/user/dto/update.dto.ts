import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsNumber, IsString, IsOptional, IsEnum, MaxLength, IsBoolean } from "class-validator";
import { RoleEnum } from "../../../shared/enums/role.enum";

export class UpdateUserDto {
    @Type()
    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    username?: string

    @Type()
    @IsString()
    @IsOptional()
    @MaxLength(3)
    @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase().trim() : value))
    @ApiProperty({ required: false, description: 'Qısa ad — maks. 3 böyük hərf' })
    shortName?: string

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

    @IsBoolean()
    @IsOptional()
    @ApiProperty({ required: false, description: 'Brauzer bildirişləri aktivdirmi' })
    browserNotificationsEnabled?: boolean
}