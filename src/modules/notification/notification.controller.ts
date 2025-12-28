import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "../../guard/auth.guard";
import { RolesGuard } from "../../guard/roles.guard";
import { Roles } from "../../shared/decorators/roles.decorator";
import { RoleEnum } from "../../shared/enums/role.enum";
import { NotificationService } from "./notification.service";
import { UpdateNotificationSettingsDto } from "./dto/update-settings.dto";

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationController {
	constructor(private notificationService: NotificationService) { }

	// Settings-i əldə et (admin only)
	@Get('settings')
	@UseGuards(RolesGuard)
	@Roles(RoleEnum.ADMIN)
	async getSettings() {
		return await this.notificationService.getSettings()
	}

	// Settings-i yenilə (admin only)
	@Put('settings')
	@UseGuards(RolesGuard)
	@Roles(RoleEnum.ADMIN)
	async updateSettings(@Body() dto: UpdateNotificationSettingsDto) {
		return await this.notificationService.updateSettings(dto)
	}
}
