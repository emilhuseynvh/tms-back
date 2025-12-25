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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrashService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const folder_entity_1 = require("../../entities/folder.entity");
const tasklist_entity_1 = require("../../entities/tasklist.entity");
const task_entity_1 = require("../../entities/task.entity");
const activity_log_service_1 = require("../activity-log/activity-log.service");
const activity_log_entity_1 = require("../../entities/activity-log.entity");
const nestjs_cls_1 = require("nestjs-cls");
let TrashService = class TrashService {
    folderRepo;
    taskListRepo;
    taskRepo;
    activityLogService;
    cls;
    constructor(folderRepo, taskListRepo, taskRepo, activityLogService, cls) {
        this.folderRepo = folderRepo;
        this.taskListRepo = taskListRepo;
        this.taskRepo = taskRepo;
        this.activityLogService = activityLogService;
        this.cls = cls;
    }
    async getTrash() {
        const user = this.cls.get('user');
        const isAdmin = user.role === 'admin';
        const foldersQuery = this.folderRepo.createQueryBuilder('folder')
            .withDeleted()
            .leftJoinAndSelect('folder.owner', 'owner')
            .where('folder.deletedAt IS NOT NULL');
        const listsQuery = this.taskListRepo.createQueryBuilder('list')
            .withDeleted()
            .leftJoinAndSelect('list.folder', 'folder')
            .leftJoinAndSelect('folder.owner', 'owner')
            .where('list.deletedAt IS NOT NULL');
        const tasksQuery = this.taskRepo.createQueryBuilder('task')
            .withDeleted()
            .leftJoinAndSelect('task.taskList', 'taskList')
            .leftJoinAndSelect('taskList.folder', 'folder')
            .leftJoinAndSelect('folder.owner', 'owner')
            .where('task.deletedAt IS NOT NULL');
        if (!isAdmin) {
            foldersQuery.andWhere('folder.ownerId = :userId', { userId: user.id });
            listsQuery.andWhere('folder.ownerId = :userId', { userId: user.id });
            tasksQuery.andWhere('folder.ownerId = :userId', { userId: user.id });
        }
        const [folders, lists, tasks] = await Promise.all([
            foldersQuery.orderBy('folder.deletedAt', 'DESC').getMany(),
            listsQuery.orderBy('list.deletedAt', 'DESC').getMany(),
            tasksQuery.orderBy('task.deletedAt', 'DESC').getMany()
        ]);
        return { folders, lists, tasks };
    }
    async restoreFolder(id) {
        const user = this.cls.get('user');
        const folder = await this.folderRepo.createQueryBuilder('folder')
            .withDeleted()
            .where('folder.id = :id', { id })
            .andWhere('folder.deletedAt IS NOT NULL')
            .getOne();
        if (!folder)
            throw new common_1.NotFoundException('Qovluq tapılmadı!');
        if (user.role !== 'admin' && folder.ownerId !== user.id) {
            throw new common_1.ForbiddenException('Bu qovluğu bərpa etmək üçün icazəniz yoxdur!');
        }
        await this.folderRepo.restore(id);
        await this.activityLogService.log(activity_log_entity_1.ActivityType.FOLDER_RESTORE, id, folder.name, `"${folder.name}" qovluğu bərpa edildi`);
        return { message: 'Qovluq bərpa edildi!' };
    }
    async restoreList(id) {
        const user = this.cls.get('user');
        const list = await this.taskListRepo.createQueryBuilder('list')
            .withDeleted()
            .leftJoinAndSelect('list.folder', 'folder')
            .where('list.id = :id', { id })
            .andWhere('list.deletedAt IS NOT NULL')
            .getOne();
        if (!list)
            throw new common_1.NotFoundException('Siyahı tapılmadı!');
        if (user.role !== 'admin' && list.folder?.ownerId !== user.id) {
            throw new common_1.ForbiddenException('Bu siyahını bərpa etmək üçün icazəniz yoxdur!');
        }
        await this.taskListRepo.restore(id);
        await this.activityLogService.log(activity_log_entity_1.ActivityType.LIST_RESTORE, id, list.name, `"${list.name}" siyahısı bərpa edildi`);
        return { message: 'Siyahı bərpa edildi!' };
    }
    async restoreTask(id) {
        const user = this.cls.get('user');
        const task = await this.taskRepo.createQueryBuilder('task')
            .withDeleted()
            .leftJoinAndSelect('task.taskList', 'taskList')
            .leftJoinAndSelect('taskList.folder', 'folder')
            .where('task.id = :id', { id })
            .andWhere('task.deletedAt IS NOT NULL')
            .getOne();
        if (!task)
            throw new common_1.NotFoundException('Tapşırıq tapılmadı!');
        if (user.role !== 'admin' && task.taskList?.folder?.ownerId !== user.id) {
            throw new common_1.ForbiddenException('Bu tapşırığı bərpa etmək üçün icazəniz yoxdur!');
        }
        await this.taskRepo.restore(id);
        await this.activityLogService.log(activity_log_entity_1.ActivityType.TASK_RESTORE, id, task.title, `"${task.title}" tapşırığı bərpa edildi`);
        return { message: 'Tapşırıq bərpa edildi!' };
    }
    async permanentDeleteFolder(id) {
        const user = this.cls.get('user');
        const folder = await this.folderRepo.createQueryBuilder('folder')
            .withDeleted()
            .where('folder.id = :id', { id })
            .andWhere('folder.deletedAt IS NOT NULL')
            .getOne();
        if (!folder)
            throw new common_1.NotFoundException('Qovluq tapılmadı!');
        if (user.role !== 'admin' && folder.ownerId !== user.id) {
            throw new common_1.ForbiddenException('Bu qovluğu silmək üçün icazəniz yoxdur!');
        }
        await this.folderRepo.delete(id);
        return { message: 'Qovluq həmişəlik silindi!' };
    }
    async permanentDeleteList(id) {
        const user = this.cls.get('user');
        const list = await this.taskListRepo.createQueryBuilder('list')
            .withDeleted()
            .leftJoinAndSelect('list.folder', 'folder')
            .where('list.id = :id', { id })
            .andWhere('list.deletedAt IS NOT NULL')
            .getOne();
        if (!list)
            throw new common_1.NotFoundException('Siyahı tapılmadı!');
        if (user.role !== 'admin' && list.folder?.ownerId !== user.id) {
            throw new common_1.ForbiddenException('Bu siyahını silmək üçün icazəniz yoxdur!');
        }
        await this.taskListRepo.delete(id);
        return { message: 'Siyahı həmişəlik silindi!' };
    }
    async permanentDeleteTask(id) {
        const user = this.cls.get('user');
        const task = await this.taskRepo.createQueryBuilder('task')
            .withDeleted()
            .leftJoinAndSelect('task.taskList', 'taskList')
            .leftJoinAndSelect('taskList.folder', 'folder')
            .where('task.id = :id', { id })
            .andWhere('task.deletedAt IS NOT NULL')
            .getOne();
        if (!task)
            throw new common_1.NotFoundException('Tapşırıq tapılmadı!');
        if (user.role !== 'admin' && task.taskList?.folder?.ownerId !== user.id) {
            throw new common_1.ForbiddenException('Bu tapşırığı silmək üçün icazəniz yoxdur!');
        }
        await this.taskRepo.delete(id);
        return { message: 'Tapşırıq həmişəlik silindi!' };
    }
};
exports.TrashService = TrashService;
exports.TrashService = TrashService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(folder_entity_1.FolderEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(tasklist_entity_1.TaskListEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(task_entity_1.TaskEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        activity_log_service_1.ActivityLogService,
        nestjs_cls_1.ClsService])
], TrashService);
//# sourceMappingURL=trash.service.js.map