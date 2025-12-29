import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SpaceEntity } from "../../entities/space.entity";
import { FolderEntity } from "../../entities/folder.entity";
import { TaskListEntity } from "../../entities/tasklist.entity";
import { TaskEntity } from "../../entities/task.entity";
import { ArchiveService } from "./archive.service";
import { ArchiveController } from "./archive.controller";

@Module({
	imports: [
		TypeOrmModule.forFeature([SpaceEntity, FolderEntity, TaskListEntity, TaskEntity])
	],
	controllers: [ArchiveController],
	providers: [ArchiveService],
	exports: [ArchiveService]
})
export class ArchiveModule { }
