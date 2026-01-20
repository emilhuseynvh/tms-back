import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FolderEntity } from "../../entities/folder.entity";
import { TaskListEntity } from "../../entities/tasklist.entity";
import { FolderService } from "./folder.service";
import { FolderController } from "./folder.controller";
import { ActivityLogModule } from "../activity-log/activity-log.module";
import { NotificationModule } from "../notification/notification.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([FolderEntity, TaskListEntity]),
		ActivityLogModule,
		forwardRef(() => NotificationModule)
	],
	controllers: [FolderController],
	providers: [FolderService],
	exports: [FolderService]
})
export class FolderModule { };

