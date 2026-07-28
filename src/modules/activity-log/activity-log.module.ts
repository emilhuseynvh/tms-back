import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ActivityLogEntity } from "../../entities/activity-log.entity";
import { TaskEntity } from "../../entities/task.entity";
import { TaskListEntity } from "../../entities/tasklist.entity";
import { FolderEntity } from "../../entities/folder.entity";
import { SpaceEntity } from "../../entities/space.entity";
import { ActivityLogService } from "./activity-log.service";
import { ActivityLogController } from "./activity-log.controller";

@Module({
	imports: [TypeOrmModule.forFeature([ActivityLogEntity, TaskEntity, TaskListEntity, FolderEntity, SpaceEntity])],
	controllers: [ActivityLogController],
	providers: [ActivityLogService],
	exports: [ActivityLogService]
})
export class ActivityLogModule { }
