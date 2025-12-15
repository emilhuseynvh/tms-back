import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TaskStatusEntity } from "../../entities/task-status.entity";
import { TaskStatusService } from "./task-status.service";
import { TaskStatusController } from "./task-status.controller";

@Module({
	imports: [TypeOrmModule.forFeature([TaskStatusEntity])],
	controllers: [TaskStatusController],
	providers: [TaskStatusService],
	exports: [TaskStatusService]
})
export class TaskStatusModule { };
