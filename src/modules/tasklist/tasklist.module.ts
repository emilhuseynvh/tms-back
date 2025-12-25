import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TaskListEntity } from "../../entities/tasklist.entity";
import { TaskListService } from "./tasklist.service";
import { TaskListController } from "./tasklist.controller";
import { ActivityLogModule } from "../activity-log/activity-log.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([TaskListEntity]),
		ActivityLogModule
	],
	controllers: [TaskListController],
	providers: [TaskListService],
	exports: [TaskListService]
})
export class TaskListModule { };

