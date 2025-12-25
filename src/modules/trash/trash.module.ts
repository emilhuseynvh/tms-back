import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FolderEntity } from "../../entities/folder.entity";
import { TaskListEntity } from "../../entities/tasklist.entity";
import { TaskEntity } from "../../entities/task.entity";
import { TrashService } from "./trash.service";
import { TrashController } from "./trash.controller";
import { ActivityLogModule } from "../activity-log/activity-log.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([FolderEntity, TaskListEntity, TaskEntity]),
		ActivityLogModule
	],
	controllers: [TrashController],
	providers: [TrashService],
	exports: [TrashService]
})
export class TrashModule { }
