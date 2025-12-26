"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TrashCleanupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrashCleanupService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const space_entity_1 = require("../../entities/space.entity");
const folder_entity_1 = require("../../entities/folder.entity");
const tasklist_entity_1 = require("../../entities/tasklist.entity");
const task_entity_1 = require("../../entities/task.entity");
const telegram_service_1 = require("../../shared/services/telegram.service");
let TrashCleanupService = TrashCleanupService_1 = class TrashCleanupService {
    spaceRepo;
    folderRepo;
    taskListRepo;
    taskRepo;
    telegramService;
    logger = new common_1.Logger(TrashCleanupService_1.name);
    constructor(spaceRepo, folderRepo, taskListRepo, taskRepo, telegramService) {
        this.spaceRepo = spaceRepo;
        this.folderRepo = folderRepo;
        this.taskListRepo = taskListRepo;
        this.taskRepo = taskRepo;
        this.telegramService = telegramService;
    }
    async cleanupOldTrash() {
        this.logger.log('Zibil qabı təmizləmə başladı...');
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        try {
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
            await this.telegramService.sendMessage(summary);
        }
        catch (error) {
            this.logger.error('Zibil qabı təmizləmə xətası:', error);
            await this.telegramService.sendError({
                message: 'Zibil qabı avtomatik təmizləmə xətası',
                stack: error.stack,
                statusCode: 500
            });
        }
    }
};
exports.TrashCleanupService = TrashCleanupService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_3AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TrashCleanupService.prototype, "cleanupOldTrash", null);
exports.TrashCleanupService = TrashCleanupService = TrashCleanupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(space_entity_1.SpaceEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(folder_entity_1.FolderEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(tasklist_entity_1.TaskListEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(task_entity_1.TaskEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        telegram_service_1.TelegramService])
], TrashCleanupService);
//# sourceMappingURL=trash-cleanup.service.js.map