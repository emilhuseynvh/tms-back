import { IsOptional, IsString, IsDateString } from "class-validator";

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
}
