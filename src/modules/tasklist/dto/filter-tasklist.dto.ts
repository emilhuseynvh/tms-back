import { IsOptional, IsString, IsDateString } from "class-validator";

export class FilterTaskListDto {
	@IsOptional()
	@IsString()
	search?: string;

	@IsOptional()
	@IsDateString()
	startDate?: string;

	@IsOptional()
	@IsDateString()
	endDate?: string;
}
