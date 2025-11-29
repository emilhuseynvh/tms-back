import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskListDto } from './create-tasklist.dto';

export class UpdateTaskListDto extends PartialType(CreateTaskListDto) {}
