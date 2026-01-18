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
exports.FolderService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const folder_entity_1 = require("../../entities/folder.entity");
const tasklist_entity_1 = require("../../entities/tasklist.entity");
const nestjs_cls_1 = require("nestjs-cls");
const activity_log_service_1 = require("../activity-log/activity-log.service");
const activity_log_entity_1 = require("../../entities/activity-log.entity");
let FolderService = class FolderService {
    folderRepo;
    taskListRepo;
    cls;
    activityLogService;
    constructor(folderRepo, taskListRepo, cls, activityLogService) {
        this.folderRepo = folderRepo;
        this.taskListRepo = taskListRepo;
        this.cls = cls;
        this.activityLogService = activityLogService;
    }
    async create(ownerId, dto) {
        const folder = this.folderRepo.create({
            name: dto.name,
            description: dto.description,
            spaceId: dto.spaceId,
            ownerId
        });
        const savedFolder = await this.folderRepo.save(folder);
        const defaultList = this.taskListRepo.create({
            name: 'Siyahı',
            folderId: savedFolder.id,
            spaceId: dto.spaceId
        });
        const savedDefaultList = await this.taskListRepo.save(defaultList);
        await this.activityLogService.log(activity_log_entity_1.ActivityType.FOLDER_CREATE, savedFolder.id, savedFolder.name, `"${savedFolder.name}" qovluğu yaradıldı`);
        return {
            id: savedFolder.id,
            name: savedFolder.name,
            description: savedFolder.description,
            spaceId: savedFolder.spaceId,
            ownerId: savedFolder.ownerId,
            createdAt: savedFolder.createdAt,
            updatedAt: savedFolder.updatedAt,
            taskLists: [savedDefaultList],
            defaultListId: savedDefaultList.id
        };
    }
    async listAll() {
        return await this.folderRepo.find({ order: { order: 'ASC' } });
    }
    async listByOwner(ownerId) {
        return await this.folderRepo.find({ where: { ownerId }, order: { order: 'ASC' } });
    }
    async listBySpace(spaceId) {
        return await this.folderRepo.find({
            where: { spaceId },
            order: { order: 'ASC' },
            relations: ['taskLists']
        });
    }
    async getFullDetails(id, search) {
        const folder = await this.folderRepo.findOne({
            where: { id, isArchived: false },
            relations: ['taskLists', 'taskLists.tasks', 'taskLists.tasks.assignees', 'taskLists.tasks.status', 'space']
        });
        if (!folder)
            throw new common_1.NotFoundException('Qovluq tapılmadı!');
        const taskLists = folder.taskLists
            ?.filter(l => !l.isArchived && !l.deletedAt)
            ?.map(list => ({
            ...list,
            tasks: list.tasks?.filter(t => !t.isArchived && !t.deletedAt) || []
        })) || [];
        const allTasks = [];
        taskLists.forEach(list => {
            allTasks.push(...list.tasks.map(t => ({ ...t, listName: list.name })));
        });
        if (search) {
            const searchLower = search.toLowerCase();
            const filteredLists = taskLists.filter(l => l.name.toLowerCase().includes(searchLower));
            const filteredTasks = allTasks.filter(t => t.title?.toLowerCase().includes(searchLower) || t.description?.toLowerCase().includes(searchLower));
            return {
                ...folder,
                taskLists: filteredLists,
                allTasks: filteredTasks
            };
        }
        return {
            ...folder,
            taskLists,
            allTasks
        };
    }
    async updateFolder(id, userId, dto) {
        const folder = await this.folderRepo.findOne({ where: { id } });
        if (!folder)
            throw new common_1.NotFoundException('Qovluq tapılmadı!');
        const user = this.cls.get('user');
        if (user.role !== 'admin' && folder.ownerId !== userId) {
            throw new common_1.UnauthorizedException('Qovluğu yeniləmək üçün icazəniz yoxdur!');
        }
        const oldName = folder.name;
        Object.assign(folder, dto);
        await this.folderRepo.save(folder);
        await this.activityLogService.log(activity_log_entity_1.ActivityType.FOLDER_UPDATE, id, folder.name, `"${oldName}" qovluğu yeniləndi`, { ...dto });
        return { message: "Qovluq uğurla yeniləndi" };
    }
    async deleteFolder(id, userId) {
        const folder = await this.folderRepo.findOne({ where: { id } });
        if (!folder)
            throw new common_1.NotFoundException('Qovluq tapılmadı!');
        const user = this.cls.get('user');
        if (user.role !== 'admin' && folder.ownerId !== userId) {
            throw new common_1.UnauthorizedException('Qovluğu silmək üçün icazəniz yoxdur!');
        }
        folder.deletedById = user.id;
        await this.folderRepo.save(folder);
        await this.folderRepo.softDelete({ id });
        await this.activityLogService.log(activity_log_entity_1.ActivityType.FOLDER_DELETE, id, folder.name, `"${folder.name}" qovluğu silindi`);
        return { message: "Qovluq uğurla silindi" };
    }
    async reorderFolders(spaceId, folderIds) {
        for (let i = 0; i < folderIds.length; i++) {
            await this.folderRepo.update(folderIds[i], { order: i });
        }
        return { message: "Sıralama yeniləndi" };
    }
    async moveFolder(id, targetSpaceId) {
        const folder = await this.folderRepo.findOne({ where: { id } });
        if (!folder)
            throw new common_1.NotFoundException('Qovluq tapılmadı!');
        const oldSpaceId = folder.spaceId;
        folder.spaceId = targetSpaceId;
        await this.folderRepo.save(folder);
        await this.taskListRepo.update({ folderId: id }, { spaceId: targetSpaceId });
        await this.activityLogService.log(activity_log_entity_1.ActivityType.FOLDER_UPDATE, id, folder.name, `"${folder.name}" qovluğu başqa sahəyə köçürüldü`, { oldSpaceId, newSpaceId: targetSpaceId });
        return { message: "Qovluq köçürüldü" };
    }
};
exports.FolderService = FolderService;
exports.FolderService = FolderService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(folder_entity_1.FolderEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(tasklist_entity_1.TaskListEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        nestjs_cls_1.ClsService,
        activity_log_service_1.ActivityLogService])
], FolderService);
//# sourceMappingURL=folder.service.js.map