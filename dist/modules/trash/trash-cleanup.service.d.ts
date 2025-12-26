import { Repository } from 'typeorm';
import { SpaceEntity } from '../../entities/space.entity';
import { FolderEntity } from '../../entities/folder.entity';
import { TaskListEntity } from '../../entities/tasklist.entity';
import { TaskEntity } from '../../entities/task.entity';
import { TelegramService } from '../../shared/services/telegram.service';
export declare class TrashCleanupService {
    private spaceRepo;
    private folderRepo;
    private taskListRepo;
    private taskRepo;
    private telegramService;
    private readonly logger;
    constructor(spaceRepo: Repository<SpaceEntity>, folderRepo: Repository<FolderEntity>, taskListRepo: Repository<TaskListEntity>, taskRepo: Repository<TaskEntity>, telegramService: TelegramService);
    cleanupOldTrash(): Promise<void>;
}
