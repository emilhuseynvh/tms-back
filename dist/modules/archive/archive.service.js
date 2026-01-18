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
exports.ArchiveService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const space_entity_1 = require("../../entities/space.entity");
const folder_entity_1 = require("../../entities/folder.entity");
const tasklist_entity_1 = require("../../entities/tasklist.entity");
const task_entity_1 = require("../../entities/task.entity");
const nestjs_cls_1 = require("nestjs-cls");
let ArchiveService = class ArchiveService {
    spaceRepo;
    folderRepo;
    taskListRepo;
    taskRepo;
    cls;
    constructor(spaceRepo, folderRepo, taskListRepo, taskRepo, cls) {
        this.spaceRepo = spaceRepo;
        this.folderRepo = folderRepo;
        this.taskListRepo = taskListRepo;
        this.taskRepo = taskRepo;
        this.cls = cls;
    }
    async getArchive() {
        const user = this.cls.get('user');
        const isAdmin = user.role === 'admin';
        const spacesQuery = this.spaceRepo.createQueryBuilder('space')
            .leftJoinAndSelect('space.owner', 'owner')
            .leftJoinAndSelect('space.archivedBy', 'archivedBy')
            .where('space.isArchived = :isArchived', { isArchived: true });
        const foldersQuery = this.folderRepo.createQueryBuilder('folder')
            .leftJoinAndSelect('folder.owner', 'owner')
            .leftJoinAndSelect('folder.archivedBy', 'archivedBy')
            .leftJoinAndSelect('folder.space', 'space')
            .where('folder.isArchived = :isArchived', { isArchived: true });
        const listsQuery = this.taskListRepo.createQueryBuilder('list')
            .leftJoinAndSelect('list.folder', 'folder')
            .leftJoinAndSelect('list.space', 'space')
            .leftJoinAndSelect('folder.owner', 'folderOwner')
            .leftJoinAndSelect('space.owner', 'spaceOwner')
            .leftJoinAndSelect('list.archivedBy', 'archivedBy')
            .where('list.isArchived = :isArchived', { isArchived: true });
        const tasksQuery = this.taskRepo.createQueryBuilder('task')
            .leftJoinAndSelect('task.taskList', 'taskList')
            .leftJoinAndSelect('taskList.folder', 'folder')
            .leftJoinAndSelect('taskList.space', 'space')
            .leftJoinAndSelect('folder.owner', 'folderOwner')
            .leftJoinAndSelect('space.owner', 'spaceOwner')
            .leftJoinAndSelect('task.archivedBy', 'archivedBy')
            .where('task.isArchived = :isArchived', { isArchived: true });
        if (!isAdmin) {
            spacesQuery.andWhere('space.archivedById = :userId', { userId: user.id });
            foldersQuery.andWhere('folder.archivedById = :userId', { userId: user.id });
            listsQuery.andWhere('list.archivedById = :userId', { userId: user.id });
            tasksQuery.andWhere('task.archivedById = :userId', { userId: user.id });
        }
        const [spaces, folders, lists, tasks] = await Promise.all([
            spacesQuery.orderBy('space.archivedAt', 'DESC').getMany(),
            foldersQuery.orderBy('folder.archivedAt', 'DESC').getMany(),
            listsQuery.orderBy('list.archivedAt', 'DESC').getMany(),
            tasksQuery.orderBy('task.archivedAt', 'DESC').getMany()
        ]);
        return { spaces, folders, lists, tasks };
    }
    async archiveSpace(id) {
        const user = this.cls.get('user');
        const space = await this.spaceRepo.findOne({ where: { id } });
        if (!space)
            throw new common_1.NotFoundException('Sahə tapılmadı!');
        if (user.role !== 'admin' && space.ownerId !== user.id) {
            throw new common_1.ForbiddenException('Bu sahəni arxivləmək üçün icazəniz yoxdur!');
        }
        space.isArchived = true;
        space.archivedAt = new Date();
        space.archivedById = user.id;
        await this.spaceRepo.save(space);
        return { message: 'Sahə arxivləndi!' };
    }
    async unarchiveSpace(id) {
        const user = this.cls.get('user');
        const space = await this.spaceRepo.findOne({ where: { id, isArchived: true } });
        if (!space)
            throw new common_1.NotFoundException('Arxivdə sahə tapılmadı!');
        if (user.role !== 'admin' && space.archivedById !== user.id) {
            throw new common_1.ForbiddenException('Bu sahəni arxivdən çıxarmaq üçün icazəniz yoxdur!');
        }
        space.isArchived = false;
        space.archivedAt = null;
        space.archivedById = null;
        await this.spaceRepo.save(space);
        return { message: 'Sahə arxivdən çıxarıldı!' };
    }
    async archiveFolder(id) {
        const user = this.cls.get('user');
        const folder = await this.folderRepo.findOne({ where: { id } });
        if (!folder)
            throw new common_1.NotFoundException('Qovluq tapılmadı!');
        if (user.role !== 'admin' && folder.ownerId !== user.id) {
            throw new common_1.ForbiddenException('Bu qovluğu arxivləmək üçün icazəniz yoxdur!');
        }
        folder.isArchived = true;
        folder.archivedAt = new Date();
        folder.archivedById = user.id;
        await this.folderRepo.save(folder);
        return { message: 'Qovluq arxivləndi!' };
    }
    async unarchiveFolder(id) {
        const user = this.cls.get('user');
        const folder = await this.folderRepo.findOne({ where: { id, isArchived: true } });
        if (!folder)
            throw new common_1.NotFoundException('Arxivdə qovluq tapılmadı!');
        if (user.role !== 'admin' && folder.archivedById !== user.id) {
            throw new common_1.ForbiddenException('Bu qovluğu arxivdən çıxarmaq üçün icazəniz yoxdur!');
        }
        folder.isArchived = false;
        folder.archivedAt = null;
        folder.archivedById = null;
        await this.folderRepo.save(folder);
        return { message: 'Qovluq arxivdən çıxarıldı!' };
    }
    async archiveList(id) {
        const user = this.cls.get('user');
        const list = await this.taskListRepo.findOne({
            where: { id },
            relations: ['folder', 'space']
        });
        if (!list)
            throw new common_1.NotFoundException('Siyahı tapılmadı!');
        const ownerId = list.folder?.ownerId || list.space?.ownerId;
        if (user.role !== 'admin' && ownerId !== user.id) {
            throw new common_1.ForbiddenException('Bu siyahını arxivləmək üçün icazəniz yoxdur!');
        }
        list.isArchived = true;
        list.archivedAt = new Date();
        list.archivedById = user.id;
        await this.taskListRepo.save(list);
        return { message: 'Siyahı arxivləndi!' };
    }
    async unarchiveList(id) {
        const user = this.cls.get('user');
        const list = await this.taskListRepo.findOne({ where: { id, isArchived: true } });
        if (!list)
            throw new common_1.NotFoundException('Arxivdə siyahı tapılmadı!');
        if (user.role !== 'admin' && list.archivedById !== user.id) {
            throw new common_1.ForbiddenException('Bu siyahını arxivdən çıxarmaq üçün icazəniz yoxdur!');
        }
        list.isArchived = false;
        list.archivedAt = null;
        list.archivedById = null;
        await this.taskListRepo.save(list);
        return { message: 'Siyahı arxivdən çıxarıldı!' };
    }
    async archiveTask(id) {
        const user = this.cls.get('user');
        const task = await this.taskRepo.findOne({
            where: { id },
            relations: ['taskList', 'taskList.folder', 'taskList.space']
        });
        if (!task)
            throw new common_1.NotFoundException('Tapşırıq tapılmadı!');
        const ownerId = task.taskList?.folder?.ownerId || task.taskList?.space?.ownerId;
        if (user.role !== 'admin' && ownerId !== user.id) {
            throw new common_1.ForbiddenException('Bu tapşırığı arxivləmək üçün icazəniz yoxdur!');
        }
        await this.taskRepo.update({ id }, {
            isArchived: true,
            archivedAt: new Date(),
            archivedById: user.id
        });
        return { message: 'Tapşırıq arxivləndi!' };
    }
    async unarchiveTask(id) {
        const user = this.cls.get('user');
        const task = await this.taskRepo.findOne({ where: { id, isArchived: true } });
        if (!task)
            throw new common_1.NotFoundException('Arxivdə tapşırıq tapılmadı!');
        if (user.role !== 'admin' && task.archivedById !== user.id) {
            throw new common_1.ForbiddenException('Bu tapşırığı arxivdən çıxarmaq üçün icazəniz yoxdur!');
        }
        task.isArchived = false;
        task.archivedAt = null;
        task.archivedById = null;
        await this.taskRepo.save(task);
        return { message: 'Tapşırıq arxivdən çıxarıldı!' };
    }
};
exports.ArchiveService = ArchiveService;
exports.ArchiveService = ArchiveService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(space_entity_1.SpaceEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(folder_entity_1.FolderEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(tasklist_entity_1.TaskListEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(task_entity_1.TaskEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        nestjs_cls_1.ClsService])
], ArchiveService);
//# sourceMappingURL=archive.service.js.map