import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TaskNotificationEntity } from "../../entities/task-notification.entity";
import { NotificationSettingsEntity } from "../../entities/notification-settings.entity";
import { NotificationEntity } from "../../entities/notification.entity";
import { TaskEntity } from "../../entities/task.entity";
import { NotificationService } from "./notification.service";
import { NotificationController } from "./notification.controller";
import { NotificationGateway } from "./notification.gateway";
import { UserModule } from "../user/user.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([TaskNotificationEntity, NotificationSettingsEntity, NotificationEntity, TaskEntity]),
		UserModule
	],
	controllers: [NotificationController],
	providers: [NotificationService, NotificationGateway],
	exports: [NotificationService, NotificationGateway]
})
export class NotificationModule { }
