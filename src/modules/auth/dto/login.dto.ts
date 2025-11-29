import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsString } from "class-validator";

export class LoginDto {
    @Type()
    @IsString()
    @ApiProperty()
    email: string

    @Type()
    @IsString()
    @ApiProperty()
    password: string

}