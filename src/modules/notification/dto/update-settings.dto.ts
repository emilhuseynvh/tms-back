import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsOptional, Max, Min } from "class-validator";

export class UpdateNotificationSettingsDto {
	@IsOptional()
	@IsNumber()
	@Min(1)
	@Max(72)
	@ApiProperty({ required: false, description: 'Neçə saat əvvəl bildiriş göndərilsin (1-72 saat)', example: 2 })
	hoursBeforeDue?: number

	@IsOptional()
	@IsBoolean()
	@ApiProperty({ required: false, description: 'Bildiriş aktiv/deaktiv' })
	isEnabled?: boolean
}
