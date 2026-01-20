import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SpaceEntity } from "../../entities/space.entity";
import { TaskEntity } from "../../entities/task.entity";
import { TaskListEntity } from "../../entities/tasklist.entity";
import { SpaceService } from "./space.service";
import { SpaceController } from "./space.controller";
import { ActivityLogModule } from "../activity-log/activity-log.module";
import { NotificationModule } from "../notification/notification.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([SpaceEntity, TaskEntity, TaskListEntity]),
		ActivityLogModule,
		forwardRef(() => NotificationModule)
	],
	controllers: [SpaceController],
	providers: [SpaceService],
	exports: [SpaceService]
})
export class SpaceModule { }
