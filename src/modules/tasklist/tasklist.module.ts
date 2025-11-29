import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TaskListEntity } from "../../entities/tasklist.entity";
import { TaskListService } from "./tasklist.service";
import { TaskListController } from "./tasklist.controller";

@Module({
	imports: [TypeOrmModule.forFeature([TaskListEntity])],
	controllers: [TaskListController],
	providers: [TaskListService],
	exports: [TaskListService]
})
export class TaskListModule { };

