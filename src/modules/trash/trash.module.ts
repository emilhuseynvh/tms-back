import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SpaceEntity } from "../../entities/space.entity";
import { FolderEntity } from "../../entities/folder.entity";
import { TaskListEntity } from "../../entities/tasklist.entity";
import { TaskEntity } from "../../entities/task.entity";
import { TrashService } from "./trash.service";
import { TrashCleanupService } from "./trash-cleanup.service";
import { TrashController } from "./trash.controller";
import { ActivityLogModule } from "../activity-log/activity-log.module";
import { TelegramService } from "../../shared/services/telegram.service";

@Module({
	imports: [
		TypeOrmModule.forFeature([SpaceEntity, FolderEntity, TaskListEntity, TaskEntity]),
		ActivityLogModule
	],
	controllers: [TrashController],
	providers: [TrashService, TrashCleanupService, TelegramService],
	exports: [TrashService]
})
export class TrashModule { }
