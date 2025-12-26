import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpaceEntity } from '../../entities/space.entity';
import { FolderEntity } from '../../entities/folder.entity';
import { TaskListEntity } from '../../entities/tasklist.entity';
import { TaskEntity } from '../../entities/task.entity';
import { TelegramService } from '../../shared/services/telegram.service';

@Injectable()
export class TrashCleanupService {
	private readonly logger = new Logger(TrashCleanupService.name);

	constructor(
		@InjectRepository(SpaceEntity)
		private spaceRepo: Repository<SpaceEntity>,
		@InjectRepository(FolderEntity)
		private folderRepo: Repository<FolderEntity>,
		@InjectRepository(TaskListEntity)
		private taskListRepo: Repository<TaskListEntity>,
		@InjectRepository(TaskEntity)
		private taskRepo: Repository<TaskEntity>,
		private telegramService: TelegramService
	) { }

	// Hər gün gecə saat 03:00-da işləyir
	@Cron(CronExpression.EVERY_DAY_AT_3AM)
	async cleanupOldTrash() {
		this.logger.log('Zibil qabı təmizləmə başladı...');

		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		try {
			// 30 gündən köhnə silinmiş elementləri tap
			const [oldSpaces, oldFolders, oldLists, oldTasks] = await Promise.all([
				this.spaceRepo.createQueryBuilder('space')
					.withDeleted()
					.where('space.deletedAt IS NOT NULL')
					.andWhere('space.deletedAt < :date', { date: thirtyDaysAgo })
					.getMany(),
				this.folderRepo.createQueryBuilder('folder')
					.withDeleted()
					.where('folder.deletedAt IS NOT NULL')
					.andWhere('folder.deletedAt < :date', { date: thirtyDaysAgo })
					.getMany(),
				this.taskListRepo.createQueryBuilder('list')
					.withDeleted()
					.where('list.deletedAt IS NOT NULL')
					.andWhere('list.deletedAt < :date', { date: thirtyDaysAgo })
					.getMany(),
				this.taskRepo.createQueryBuilder('task')
					.withDeleted()
					.where('task.deletedAt IS NOT NULL')
					.andWhere('task.deletedAt < :date', { date: thirtyDaysAgo })
					.getMany()
			]);

			const totalCount = oldSpaces.length + oldFolders.length + oldLists.length + oldTasks.length;

			if (totalCount === 0) {
				this.logger.log('Silinəcək köhnə element tapılmadı.');
				return;
			}

			// Həmişəlik sil
			if (oldSpaces.length > 0) {
				await this.spaceRepo.delete(oldSpaces.map(s => s.id));
			}
			if (oldFolders.length > 0) {
				await this.folderRepo.delete(oldFolders.map(f => f.id));
			}
			if (oldLists.length > 0) {
				await this.taskListRepo.delete(oldLists.map(l => l.id));
			}
			if (oldTasks.length > 0) {
				await this.taskRepo.delete(oldTasks.map(t => t.id));
			}

			const summary = `🗑️ Zibil qabı avtomatik təmizləndi\n\n` +
				`📅 Tarix: ${new Date().toLocaleString('az-AZ', { timeZone: 'Asia/Baku' })}\n\n` +
				`Silinən elementlər:\n` +
				`• Sahələr: ${oldSpaces.length}\n` +
				`• Qovluqlar: ${oldFolders.length}\n` +
				`• Siyahılar: ${oldLists.length}\n` +
				`• Tapşırıqlar: ${oldTasks.length}\n\n` +
				`Cəmi: ${totalCount} element həmişəlik silindi.`;

			this.logger.log(summary);

			// Telegram-a bildiriş göndər
			await this.telegramService.sendMessage(summary);

		} catch (error) {
			this.logger.error('Zibil qabı təmizləmə xətası:', error);
			await this.telegramService.sendError({
				message: 'Zibil qabı avtomatik təmizləmə xətası',
				stack: error.stack,
				statusCode: 500
			});
		}
	}
}
