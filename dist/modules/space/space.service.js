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
exports.SpaceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const space_entity_1 = require("../../entities/space.entity");
const task_entity_1 = require("../../entities/task.entity");
const nestjs_cls_1 = require("nestjs-cls");
const activity_log_service_1 = require("../activity-log/activity-log.service");
const activity_log_entity_1 = require("../../entities/activity-log.entity");
let SpaceService = class SpaceService {
    spaceRepo;
    taskRepo;
    cls;
    activityLogService;
    constructor(spaceRepo, taskRepo, cls, activityLogService) {
        this.spaceRepo = spaceRepo;
        this.taskRepo = taskRepo;
        this.cls = cls;
        this.activityLogService = activityLogService;
    }
    async create(ownerId, dto) {
        const space = this.spaceRepo.create({ ...dto, ownerId });
        const savedSpace = await this.spaceRepo.save(space);
        await this.activityLogService.log(activity_log_entity_1.ActivityType.SPACE_CREATE, savedSpace.id, savedSpace.name, `"${savedSpace.name}" sahəsi yaradıldı`);
        return savedSpace;
    }
    async listAll() {
        return await this.spaceRepo.find({
            order: { createdAt: 'DESC' },
            relations: ['folders', 'taskLists']
        });
    }
    async listByOwner(ownerId) {
        const user = this.cls.get('user');
        if (user?.role === 'admin') {
            return await this.spaceRepo.find({
                where: { isArchived: false },
                order: { createdAt: 'DESC' },
                relations: ['folders', 'folders.taskLists', 'taskLists']
            });
        }
        const ownedSpaceIds = await this.spaceRepo
            .createQueryBuilder('space')
            .where('space.ownerId = :ownerId', { ownerId })
            .andWhere('space.isArchived = false')
            .andWhere('space.deletedAt IS NULL')
            .select('space.id')
            .getRawMany();
        const assignedSpaceIds = await this.taskRepo
            .createQueryBuilder('task')
            .innerJoin('task.assignees', 'assignee', 'assignee.id = :userId', { userId: ownerId })
            .innerJoin('task.taskList', 'taskList')
            .leftJoin('taskList.folder', 'folder')
            .leftJoin('taskList.space', 'directSpace')
            .leftJoin('folder.space', 'folderSpace')
            .where('task.deletedAt IS NULL')
            .andWhere('task.isArchived = false')
            .select('DISTINCT COALESCE(directSpace.id, folderSpace.id)', 'spaceId')
            .getRawMany();
        const allSpaceIds = [
            ...ownedSpaceIds.map(r => r.space_id),
            ...assignedSpaceIds.map(r => r.spaceId)
        ].filter(id => id !== null);
        const uniqueSpaceIds = [...new Set(allSpaceIds)];
        if (uniqueSpaceIds.length === 0) {
            return [];
        }
        return await this.spaceRepo
            .createQueryBuilder('space')
            .leftJoinAndSelect('space.folders', 'folders', 'folders.isArchived = false AND folders.deletedAt IS NULL')
            .leftJoinAndSelect('folders.taskLists', 'folderTaskLists', 'folderTaskLists.isArchived = false AND folderTaskLists.deletedAt IS NULL')
            .leftJoinAndSelect('space.taskLists', 'taskLists', 'taskLists.isArchived = false AND taskLists.deletedAt IS NULL AND taskLists.folderId IS NULL')
            .where('space.id IN (:...spaceIds)', { spaceIds: uniqueSpaceIds })
            .andWhere('space.isArchived = false')
            .andWhere('space.deletedAt IS NULL')
            .orderBy('space.order', 'ASC')
            .addOrderBy('folders.order', 'ASC')
            .addOrderBy('folderTaskLists.order', 'ASC')
            .addOrderBy('taskLists.order', 'ASC')
            .getMany();
    }
    async getOne(id) {
        const space = await this.spaceRepo.findOne({
            where: { id },
            relations: ['folders', 'folders.taskLists', 'taskLists']
        });
        if (!space)
            throw new common_1.NotFoundException('Sahə tapılmadı!');
        return space;
    }
    async getFullDetails(id, search) {
        const space = await this.spaceRepo.findOne({
            where: { id, isArchived: false },
            relations: ['folders', 'folders.taskLists', 'folders.taskLists.tasks', 'folders.taskLists.tasks.assignees', 'folders.taskLists.tasks.status', 'taskLists', 'taskLists.tasks', 'taskLists.tasks.assignees', 'taskLists.tasks.status']
        });
        if (!space)
            throw new common_1.NotFoundException('Sahə tapılmadı!');
        const folders = space.folders
            ?.filter(f => !f.isArchived && !f.deletedAt)
            ?.map(folder => ({
            ...folder,
            taskLists: folder.taskLists
                ?.filter(l => !l.isArchived && !l.deletedAt)
                ?.map(list => ({
                ...list,
                tasks: list.tasks?.filter(t => !t.isArchived && !t.deletedAt) || []
            })) || []
        })) || [];
        const directLists = space.taskLists
            ?.filter(l => !l.folderId && !l.isArchived && !l.deletedAt)
            ?.map(list => ({
            ...list,
            tasks: list.tasks?.filter(t => !t.isArchived && !t.deletedAt) || []
        })) || [];
        const allTasks = [];
        folders.forEach(folder => {
            folder.taskLists.forEach(list => {
                allTasks.push(...list.tasks.map(t => ({ ...t, listName: list.name, folderName: folder.name })));
            });
        });
        directLists.forEach(list => {
            allTasks.push(...list.tasks.map(t => ({ ...t, listName: list.name, folderName: null })));
        });
        if (search) {
            const searchLower = search.toLowerCase();
            const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(searchLower));
            const filteredLists = directLists.filter(l => l.name.toLowerCase().includes(searchLower));
            const filteredTasks = allTasks.filter(t => t.title?.toLowerCase().includes(searchLower) || t.description?.toLowerCase().includes(searchLower));
            return {
                ...space,
                folders: filteredFolders,
                directLists: filteredLists,
                allTasks: filteredTasks
            };
        }
        return {
            ...space,
            folders,
            directLists,
            allTasks
        };
    }
    async updateSpace(id, userId, dto) {
        const space = await this.spaceRepo.findOne({ where: { id } });
        if (!space)
            throw new common_1.NotFoundException('Sahə tapılmadı!');
        const user = this.cls.get('user');
        if (user?.role !== 'admin' && space.ownerId !== userId) {
            throw new common_1.UnauthorizedException('Sahəni yeniləmək üçün icazəniz yoxdur!');
        }
        const oldName = space.name;
        Object.assign(space, dto);
        await this.spaceRepo.save(space);
        await this.activityLogService.log(activity_log_entity_1.ActivityType.SPACE_UPDATE, id, space.name, `"${oldName}" sahəsi yeniləndi`, { ...dto });
        return { message: "Sahə uğurla yeniləndi" };
    }
    async deleteSpace(id, userId) {
        const space = await this.spaceRepo.findOne({ where: { id } });
        if (!space)
            throw new common_1.NotFoundException('Sahə tapılmadı!');
        const user = this.cls.get('user');
        if (user?.role !== 'admin' && space.ownerId !== userId) {
            throw new common_1.UnauthorizedException('Sahəni silmək üçün icazəniz yoxdur!');
        }
        await this.spaceRepo.softDelete({ id });
        await this.activityLogService.log(activity_log_entity_1.ActivityType.SPACE_DELETE, id, space.name, `"${space.name}" sahəsi silindi`);
        return { message: "Sahə uğurla silindi" };
    }
    async reorderSpaces(spaceIds) {
        for (let i = 0; i < spaceIds.length; i++) {
            await this.spaceRepo.update(spaceIds[i], { order: i });
        }
        return { message: "Sıralama yeniləndi" };
    }
};
exports.SpaceService = SpaceService;
exports.SpaceService = SpaceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(space_entity_1.SpaceEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(task_entity_1.TaskEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        nestjs_cls_1.ClsService,
        activity_log_service_1.ActivityLogService])
], SpaceService);
//# sourceMappingURL=space.service.js.map