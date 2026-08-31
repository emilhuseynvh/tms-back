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
const tasklist_entity_1 = require("../../entities/tasklist.entity");
const nestjs_cls_1 = require("nestjs-cls");
const activity_log_service_1 = require("../activity-log/activity-log.service");
const activity_log_entity_1 = require("../../entities/activity-log.entity");
const notification_service_1 = require("../notification/notification.service");
const notification_entity_1 = require("../../entities/notification.entity");
const assignee_defaults_service_1 = require("../../shared/services/assignee-defaults.service");
const filter_date_utils_1 = require("../../shared/utils/filter-date.utils");
let SpaceService = class SpaceService {
    spaceRepo;
    taskRepo;
    taskListRepo;
    assigneeDefaults;
    cls;
    activityLogService;
    notificationService;
    constructor(spaceRepo, taskRepo, taskListRepo, assigneeDefaults, cls, activityLogService, notificationService) {
        this.spaceRepo = spaceRepo;
        this.taskRepo = taskRepo;
        this.taskListRepo = taskListRepo;
        this.assigneeDefaults = assigneeDefaults;
        this.cls = cls;
        this.activityLogService = activityLogService;
        this.notificationService = notificationService;
    }
    async create(ownerId, dto) {
        const assigneeIds = await this.assigneeDefaults.mergeResourceAssignees(dto.assigneeIds, ownerId);
        const space = this.spaceRepo.create({ ...dto, ownerId });
        space.assignees = assigneeIds.map((id) => ({ id }));
        const savedSpace = await this.spaceRepo.save(space);
        const defaultList = this.taskListRepo.create({
            name: 'Siyahı',
            spaceId: savedSpace.id,
            folderId: null,
            assignees: assigneeIds.map((id) => ({ id })),
        });
        const savedDefaultList = await this.taskListRepo.save(defaultList);
        for (const userId of assigneeIds) {
            if (userId !== ownerId) {
                await this.notificationService.createNotification({
                    userId,
                    type: notification_entity_1.NotificationType.SPACE_ASSIGNED,
                    title: 'Space-ə əlavə edildiniz',
                    message: `"${savedSpace.name}" space-inə əlavə edildiniz`,
                    spaceId: savedSpace.id
                });
            }
        }
        await this.activityLogService.log(activity_log_entity_1.ActivityType.SPACE_CREATE, savedSpace.id, savedSpace.name, `"${savedSpace.name}" sahəsi yaradıldı`, assigneeIds.length ? { assignees: assigneeIds } : undefined);
        return {
            ...savedSpace,
            taskLists: [savedDefaultList],
            folders: []
        };
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
            return await this.spaceRepo
                .createQueryBuilder('space')
                .leftJoinAndSelect('space.assignees', 'spaceAssignees')
                .leftJoinAndSelect('space.owner', 'spaceOwner')
                .leftJoinAndSelect('space.folders', 'folders', 'folders.isArchived = false AND folders.deletedAt IS NULL')
                .leftJoinAndSelect('folders.assignees', 'folderAssignees')
                .leftJoinAndSelect('folders.owner', 'folderOwner')
                .leftJoinAndSelect('folders.taskLists', 'folderTaskLists', 'folderTaskLists.isArchived = false AND folderTaskLists.deletedAt IS NULL')
                .leftJoinAndSelect('folderTaskLists.assignees', 'folderTaskListAssignees')
                .leftJoinAndSelect('folderTaskLists.createdBy', 'folderTaskListCreatedBy')
                .leftJoinAndSelect('space.taskLists', 'taskLists', 'taskLists.isArchived = false AND taskLists.deletedAt IS NULL AND taskLists.folderId IS NULL')
                .leftJoinAndSelect('taskLists.assignees', 'taskListAssignees')
                .leftJoinAndSelect('taskLists.createdBy', 'taskListCreatedBy')
                .where('space.isArchived = false')
                .andWhere('space.deletedAt IS NULL')
                .orderBy('space.order', 'ASC')
                .addOrderBy('folders.order', 'ASC')
                .addOrderBy('folderTaskLists.order', 'ASC')
                .addOrderBy('taskLists.order', 'ASC')
                .getMany();
        }
        const ownedSpaceIds = await this.spaceRepo
            .createQueryBuilder('space')
            .where('space.ownerId = :ownerId', { ownerId })
            .andWhere('space.isArchived = false')
            .andWhere('space.deletedAt IS NULL')
            .select('space.id')
            .getRawMany();
        const spaceAssignedIds = await this.spaceRepo
            .createQueryBuilder('space')
            .innerJoin('space.assignees', 'assignee', 'assignee.id = :userId', { userId: ownerId })
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
        const listAssignedSpaceIds = await this.taskListRepo
            .createQueryBuilder('taskList')
            .innerJoin('taskList.assignees', 'assignee', 'assignee.id = :userId', { userId: ownerId })
            .leftJoin('taskList.folder', 'folder')
            .leftJoin('taskList.space', 'directSpace')
            .leftJoin('folder.space', 'folderSpace')
            .where('taskList.deletedAt IS NULL')
            .andWhere('taskList.isArchived = false')
            .select('DISTINCT COALESCE(directSpace.id, folderSpace.id)', 'spaceId')
            .getRawMany();
        const folderAssignedSpaceIds = await this.spaceRepo
            .createQueryBuilder('space')
            .innerJoin('space.folders', 'folder')
            .innerJoin('folder.assignees', 'assignee', 'assignee.id = :userId', { userId: ownerId })
            .where('folder.deletedAt IS NULL')
            .andWhere('folder.isArchived = false')
            .andWhere('space.deletedAt IS NULL')
            .andWhere('space.isArchived = false')
            .select('DISTINCT space.id', 'spaceId')
            .getRawMany();
        const allSpaceIds = [
            ...ownedSpaceIds.map(r => r.space_id),
            ...spaceAssignedIds.map(r => r.space_id),
            ...assignedSpaceIds.map(r => r.spaceId),
            ...listAssignedSpaceIds.map(r => r.spaceId),
            ...folderAssignedSpaceIds.map(r => r.spaceId)
        ].filter(id => id !== null);
        const uniqueSpaceIds = [...new Set(allSpaceIds)];
        if (uniqueSpaceIds.length === 0) {
            return [];
        }
        return await this.spaceRepo
            .createQueryBuilder('space')
            .leftJoinAndSelect('space.assignees', 'spaceAssignees')
            .leftJoinAndSelect('space.owner', 'spaceOwner')
            .leftJoinAndSelect('space.folders', 'folders', 'folders.isArchived = false AND folders.deletedAt IS NULL')
            .leftJoinAndSelect('folders.assignees', 'folderAssignees')
            .leftJoinAndSelect('folders.owner', 'folderOwner')
            .leftJoinAndSelect('folders.taskLists', 'folderTaskLists', 'folderTaskLists.isArchived = false AND folderTaskLists.deletedAt IS NULL')
            .leftJoinAndSelect('folderTaskLists.assignees', 'folderTaskListAssignees')
            .leftJoinAndSelect('folderTaskLists.createdBy', 'folderTaskListCreatedBy')
            .leftJoinAndSelect('space.taskLists', 'taskLists', 'taskLists.isArchived = false AND taskLists.deletedAt IS NULL AND taskLists.folderId IS NULL')
            .leftJoinAndSelect('taskLists.assignees', 'taskListAssignees')
            .leftJoinAndSelect('taskLists.createdBy', 'taskListCreatedBy')
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
    taskMatchesFilters(task, filters) {
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            const titleMatch = task.title?.toLowerCase().includes(searchLower);
            const descMatch = task.description?.toLowerCase().includes(searchLower);
            if (!titleMatch && !descMatch)
                return false;
        }
        if (filters.statusId) {
            if (task.statusId !== parseInt(filters.statusId, 10))
                return false;
        }
        if (filters.assigneeId) {
            const assigneeIds = task.assignees?.map((a) => a.id) || [];
            if (!assigneeIds.includes(parseInt(filters.assigneeId, 10)))
                return false;
        }
        if (!(0, filter_date_utils_1.taskMatchesTaskDateFilters)(task, filters.startDate, filters.endDate)) {
            return false;
        }
        return true;
    }
    hasActiveTaskFilters(filters) {
        if (!filters)
            return false;
        return !!(filters.search || filters.statusId || filters.assigneeId || filters.startDate || filters.endDate);
    }
    applyListFilters(taskLists, filters) {
        if (!this.hasActiveTaskFilters(filters)) {
            const allTasks = [];
            taskLists.forEach((list) => {
                allTasks.push(...(list.tasks || []).map((t) => ({ ...t, listName: list.name })));
            });
            return { taskLists, allTasks };
        }
        const searchLower = filters?.search?.toLowerCase();
        const filteredLists = [];
        const allTasks = [];
        for (const list of taskLists) {
            const listNameMatches = searchLower ? list.name.toLowerCase().includes(searchLower) : false;
            const onlySearchFilter = filters?.search && !filters.statusId && !filters.assigneeId && !filters.startDate && !filters.endDate;
            let tasks = list.tasks;
            if (listNameMatches && onlySearchFilter) {
            }
            else {
                tasks = list.tasks.filter((t) => this.taskMatchesFilters(t, filters));
            }
            const includeList = listNameMatches || tasks.length > 0;
            if (includeList) {
                filteredLists.push({ ...list, tasks });
                allTasks.push(...tasks.map((t) => ({ ...t, listName: list.name })));
            }
        }
        return { taskLists: filteredLists, allTasks };
    }
    async getFullDetails(id, filters) {
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
        if (!this.hasActiveTaskFilters(filters)) {
            const allTasks = [];
            folders.forEach(folder => {
                folder.taskLists.forEach(list => {
                    allTasks.push(...(list.tasks || []).map(t => ({ ...t, listName: list.name, folderName: folder.name })));
                });
            });
            directLists.forEach(list => {
                allTasks.push(...(list.tasks || []).map(t => ({ ...t, listName: list.name, folderName: null })));
            });
            return { ...space, folders, directLists, allTasks };
        }
        const searchLower = filters?.search?.toLowerCase();
        const onlySearchFilter = filters?.search && !filters.statusId && !filters.assigneeId && !filters.startDate && !filters.endDate;
        const filteredFolders = [];
        const allTasks = [];
        for (const folder of folders) {
            const folderNameMatches = searchLower ? folder.name.toLowerCase().includes(searchLower) : false;
            if (folderNameMatches && onlySearchFilter) {
                filteredFolders.push(folder);
                folder.taskLists.forEach(list => {
                    allTasks.push(...(list.tasks || []).map(t => ({ ...t, listName: list.name, folderName: folder.name })));
                });
                continue;
            }
            const { taskLists: filteredLists, allTasks: folderListTasks } = this.applyListFilters(folder.taskLists, filters);
            if (filteredLists.length > 0) {
                filteredFolders.push({ ...folder, taskLists: filteredLists });
                allTasks.push(...folderListTasks.map(t => ({ ...t, folderName: folder.name })));
            }
        }
        const { taskLists: filteredDirectLists, allTasks: directTasks } = this.applyListFilters(directLists, filters);
        allTasks.push(...directTasks.map(t => ({ ...t, folderName: null })));
        return {
            ...space,
            folders: filteredFolders,
            directLists: filteredDirectLists,
            allTasks
        };
    }
    async updateSpace(id, userId, dto) {
        const space = await this.spaceRepo.findOne({
            where: { id },
            relations: ['assignees']
        });
        if (!space)
            throw new common_1.NotFoundException('Sahə tapılmadı!');
        const user = this.cls.get('user');
        if (user?.role !== 'admin' && space.ownerId !== userId) {
            throw new common_1.UnauthorizedException('Sahəni yeniləmək üçün icazəniz yoxdur!');
        }
        const oldName = space.name;
        const changes = {};
        if (dto.assigneeIds !== undefined) {
            const oldAssigneeIds = space.assignees?.map(u => u.id) || [];
            const newAssigneeIds = dto.assigneeIds || [];
            const addedUserIds = newAssigneeIds.filter(id => !oldAssigneeIds.includes(id));
            const removedUserIds = oldAssigneeIds.filter(id => !newAssigneeIds.includes(id));
            for (const assigneeId of addedUserIds) {
                await this.notificationService.createNotification({
                    userId: assigneeId,
                    type: notification_entity_1.NotificationType.SPACE_ASSIGNED,
                    title: 'Space-ə əlavə edildiniz',
                    message: `"${space.name}" space-inə əlavə edildiniz`,
                    spaceId: space.id
                });
            }
            for (const assigneeId of removedUserIds) {
                await this.notificationService.createNotification({
                    userId: assigneeId,
                    type: notification_entity_1.NotificationType.SPACE_UNASSIGNED,
                    title: 'Space-dən çıxarıldınız',
                    message: `"${space.name}" space-indən çıxarıldınız`,
                    spaceId: space.id
                });
            }
            if (addedUserIds.length || removedUserIds.length) {
                changes.assignees = { added: addedUserIds, removed: removedUserIds };
            }
            space.assignees = newAssigneeIds.map(id => ({ id }));
        }
        if (dto.name)
            changes.name = { old: oldName, new: dto.name };
        if (dto.description !== undefined)
            changes.description = dto.description;
        Object.assign(space, { name: dto.name, description: dto.description });
        await this.spaceRepo.save(space);
        await this.activityLogService.log(activity_log_entity_1.ActivityType.SPACE_UPDATE, id, space.name, `"${oldName}" sahəsi yeniləndi`, changes);
        return { message: "Sahə uğurla yeniləndi" };
    }
    async deleteSpace(id, userId) {
        const space = await this.spaceRepo.findOne({ where: { id } });
        if (!space)
            throw new common_1.NotFoundException('Sahə tapılmadı!');
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
    __param(2, (0, typeorm_1.InjectRepository)(tasklist_entity_1.TaskListEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        assignee_defaults_service_1.AssigneeDefaultsService,
        nestjs_cls_1.ClsService,
        activity_log_service_1.ActivityLogService,
        notification_service_1.NotificationService])
], SpaceService);
//# sourceMappingURL=space.service.js.map