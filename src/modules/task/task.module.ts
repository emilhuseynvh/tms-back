import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TaskEntity } from "../../entities/task.entity";
import { TaskStatusEntity } from "../../entities/task-status.entity";
import { TaskActivityEntity } from "../../entities/task-activity.entity";
import { TaskService } from "./task.service";
import { TaskController } from "./task.controller";
import { ActivityLogModule } from "../activity-log/activity-log.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([TaskEntity, TaskStatusEntity, TaskActivityEntity]),
		ActivityLogModule
	],
	controllers: [TaskController],
	providers: [TaskService],
	exports: [TaskService]
})
export class TaskModule { };
