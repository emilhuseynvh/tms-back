import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SpaceEntity } from "../../entities/space.entity";
import { TaskEntity } from "../../entities/task.entity";
import { SpaceService } from "./space.service";
import { SpaceController } from "./space.controller";
import { ActivityLogModule } from "../activity-log/activity-log.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([SpaceEntity, TaskEntity]),
		ActivityLogModule
	],
	controllers: [SpaceController],
	providers: [SpaceService],
	exports: [SpaceService]
})
export class SpaceModule { }
