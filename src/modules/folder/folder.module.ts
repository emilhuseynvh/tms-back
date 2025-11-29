import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FolderEntity } from "../../entities/folder.entity";
import { FolderService } from "./folder.service";
import { FolderController } from "./folder.controller";

@Module({
	imports: [TypeOrmModule.forFeature([FolderEntity])],
	controllers: [FolderController],
	providers: [FolderService],
	exports: [FolderService]
})
export class FolderModule { };

