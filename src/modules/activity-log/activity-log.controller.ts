import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ActivityLogService } from "./activity-log.service";
import { FilterActivityLogDto } from "./dto/filter-activity-log.dto";
import { Auth } from "../../shared/decorators/auth.decorator";

@ApiTags('activity-log')
@Controller('activity-log')
export class ActivityLogController {
	constructor(private activityLogService: ActivityLogService) { }

	@Get()
	@Auth()
	async list(@Query() filters: FilterActivityLogDto) {
		return await this.activityLogService.list(filters)
	}
}
