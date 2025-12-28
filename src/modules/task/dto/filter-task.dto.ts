import { IsOptional, IsString, IsDateString, IsNumberString } from "class-validator";

export class FilterTaskDto {
	@IsOptional()
	@IsString()
	search?: string;

	@IsOptional()
	@IsDateString()
	startDate?: string;

	@IsOptional()
	@IsDateString()
	endDate?: string;

	@IsOptional()
	@IsNumberString()
	statusId?: string;

	@IsOptional()
	@IsNumberString()
	assigneeId?: string;
}
