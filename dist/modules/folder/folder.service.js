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
const task_entity_1 = require("../../entities/task.entity");
const nestjs_cls_1 = require("nestjs-cls");
const activity_log_service_1 = require("../activity-log/activity-log.service");
const activity_log_entity_1 = require("../../entities/activity-log.entity");
const notification_service_1 = require("../notification/notification.service");
const notification_entity_1 = require("../../entities/notification.entity");
const assignee_defaults_service_1 = require("../../shared/services/assignee-defaults.service");
const filter_date_utils_1 = require("../../shared/utils/filter-date.utils");
let FolderService = class FolderService {
    folderRepo;
    taskListRepo;
    taskRepo;
    assigneeDefaults;
    cls;
    activityLogService;
    notificationService;
    constructor(folderRepo, taskListRepo, taskRepo, assigneeDefaults, cls, activityLogService, notificationService) {
        this.folderRepo = folderRepo;
        this.taskListRepo = taskListRepo;
        this.taskRepo = taskRepo;
        this.assigneeDefaults = assigneeDefaults;
        this.cls = cls;
        this.activityLogService = activityLogService;
        this.notificationService = notificationService;
    }
    async create(ownerId, dto) {
        const assigneeIds = await this.assigneeDefaults.mergeResourceAssignees(dto.assigneeIds, ownerId);
        const folder = this.folderRepo.create({
            name: dto.name,
            description: dto.description,
            spaceId: dto.spaceId,
            ownerId
        });
        folder.assignees = assigneeIds.map((id) => ({ id }));
        const savedFolder = await this.folderRepo.save(folder);
        for (const userId of assigneeIds) {
            if (userId !== ownerId) {
                await this.notificationService.createNotification({
                    userId,
                    type: notification_entity_1.NotificationType.FOLDER_ASSIGNED,
                    title: 'Qovluğa əlavə edildiniz',
                    message: `"${savedFolder.name}" qovluğuna əlavə edildiniz`,
                    folderId: savedFolder.id
                });
            }
        }
        const defaultList = this.taskListRepo.create({
            name: 'Siyahı',
            folderId: savedFolder.id,
            spaceId: null,
            assignees: assigneeIds.map((id) => ({ id })),
        });
        const savedDefaultList = await this.taskListRepo.save(defaultList);
        await this.activityLogService.log(activity_log_entity_1.ActivityType.FOLDER_CREATE, savedFolder.id, savedFolder.name, `"${savedFolder.name}" qovluğu yaradıldı`, assigneeIds.length ? { assignees: assigneeIds } : undefined);
        return {
            id: savedFolder.id,
            name: savedFolder.name,
            description: savedFolder.description,
            spaceId: savedFolder.spaceId,
            ownerId: savedFolder.ownerId,
            createdAt: savedFolder.createdAt,
            updatedAt: savedFolder.updatedAt,
            taskLists: [savedDefaultList],
            defaultListId: savedDefaultList.id,
            assignees: savedFolder.assignees || []
        };
    }
    async getVisibleFolderIdsForCurrentUser() {
        const user = this.cls.get('user');
        if (!user)
            return new Set();
        if (user.role === 'admin')
            return null;
        const userId = user.id;
        const ids = new Set();
        const addRows = (rows, keys) => {
            for (const row of rows) {
                for (const key of keys) {
                    if (row[key] != null) {
                        ids.add(Number(row[key]));
                        break;
                    }
                }
            }
        };
        const owned = await this.folderRepo.find({
            where: { ownerId: userId, isArchived: false },
            select: ['id'],
        });
        owned.forEach((f) => ids.add(f.id));
        const assignedFolders = await this.folderRepo
            .createQueryBuilder('folder')
            .innerJoin('folder.assignees', 'assignee', 'assignee.id = :userId', { userId })
            .where('folder.deletedAt IS NULL')
            .andWhere('folder.isArchived = false')
            .select('folder.id', 'id')
            .getRawMany();
        addRows(assignedFolders, ['id', 'folder_id']);
        const viaLists = await this.taskListRepo
            .createQueryBuilder('list')
            .innerJoin('list.assignees', 'assignee', 'assignee.id = :userId', { userId })
            .where('list.folderId IS NOT NULL')
            .andWhere('list.deletedAt IS NULL')
            .andWhere('list.isArchived = false')
            .select('DISTINCT list.folderId', 'id')
            .getRawMany();
        addRows(viaLists, ['id', 'folderId', 'folder_id']);
        const viaTasks = await this.taskRepo
            .createQueryBuilder('task')
            .innerJoin('task.assignees', 'assignee', 'assignee.id = :userId', { userId })
            .innerJoin('task.taskList', 'list')
            .where('list.folderId IS NOT NULL')
            .andWhere('task.deletedAt IS NULL')
            .andWhere('task.isArchived = false')
            .select('DISTINCT list.folderId', 'id')
            .getRawMany();
        addRows(viaTasks, ['id', 'folderId', 'folder_id']);
        return ids;
    }
    filterVisibleFolders(folders, visibleIds) {
        const list = folders || [];
        if (visibleIds === null)
            return list;
        return list.filter((folder) => visibleIds.has(folder.id));
    }
    async assertFolderVisible(folderId) {
        const visibleIds = await this.getVisibleFolderIdsForCurrentUser();
        if (visibleIds === null)
            return;
        if (!visibleIds.has(folderId)) {
            throw new common_1.ForbiddenException('Bu qovluğa giriş icazəniz yoxdur');
        }
    }
    async listAll() {
        const folders = await this.folderRepo.find({ order: { order: 'ASC' } });
        const visibleIds = await this.getVisibleFolderIdsForCurrentUser();
        return this.filterVisibleFolders(folders, visibleIds);
    }
    async listByOwner(ownerId) {
        const folders = await this.folderRepo.find({ where: { ownerId }, order: { order: 'ASC' } });
        const visibleIds = await this.getVisibleFolderIdsForCurrentUser();
        return this.filterVisibleFolders(folders, visibleIds);
    }
    async listBySpace(spaceId) {
        const folders = await this.folderRepo.find({
            where: { spaceId },
            order: { order: 'ASC' },
            relations: ['taskLists']
        });
        const visibleIds = await this.getVisibleFolderIdsForCurrentUser();
        return this.filterVisibleFolders(folders, visibleIds);
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
    applyFolderFilters(taskLists, filters) {
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
    toPlainTask(task, listName) {
        return {
            id: task.id,
            title: task.title,
            description: task.description,
            startAt: task.startAt,
            dueAt: task.dueAt,
            createdById: task.createdById,
            secondAssigneeId: task.secondAssigneeId,
            statusId: task.statusId,
            status: task.status
                ? { id: task.status.id, name: task.status.name, color: task.status.color }
                : null,
            order: task.order,
            taskListId: task.taskListId,
            parentId: task.parentId ?? null,
            link: task.link,
            assignees: (task.assignees || []).map((a) => ({
                id: a.id,
                name: a.name,
                username: a.username,
                email: a.email,
            })),
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
            ...(listName ? { listName } : {}),
        };
    }
    toPlainTaskLists(taskLists) {
        return (taskLists || [])
            .filter((l) => !l.isArchived && !l.deletedAt)
            .sort((a, b) => {
            const orderDiff = (a.order ?? 0) - (b.order ?? 0);
            if (orderDiff !== 0)
                return orderDiff;
            const aTime = new Date(a.createdAt).getTime();
            const bTime = new Date(b.createdAt).getTime();
            if (aTime !== bTime)
                return aTime - bTime;
            return a.id - b.id;
        })
            .map((list) => {
            const tasks = (list.tasks || [])
                .filter((t) => !t.isArchived && !t.deletedAt)
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((t) => this.toPlainTask(t, list.name));
            return {
                id: list.id,
                name: list.name,
                type: list.type,
                folderId: list.folderId,
                spaceId: list.spaceId,
                order: list.order,
                createdAt: list.createdAt,
                updatedAt: list.updatedAt,
                tasks,
            };
        });
    }
    async getFullDetails(id, filters) {
        const folder = await this.folderRepo.findOne({
            where: { id, isArchived: false },
            relations: {
                space: true,
                taskLists: {
                    tasks: {
                        assignees: true,
                        status: true,
                    },
                },
            },
        });
        if (!folder)
            throw new common_1.NotFoundException('Qovluq tapılmadı!');
        await this.assertFolderVisible(folder.id);
        const taskLists = this.toPlainTaskLists(folder.taskLists);
        const { taskLists: filteredLists, allTasks } = this.applyFolderFilters(taskLists, filters);
        return {
            id: folder.id,
            name: folder.name,
            description: folder.description,
            spaceId: folder.spaceId,
            ownerId: folder.ownerId,
            order: folder.order,
            createdAt: folder.createdAt,
            updatedAt: folder.updatedAt,
            space: folder.space
                ? { id: folder.space.id, name: folder.space.name }
                : null,
            taskLists: filteredLists,
            allTasks,
        };
    }
    async updateFolder(id, userId, dto) {
        const folder = await this.folderRepo.findOne({
            where: { id },
            relations: ['assignees']
        });
        if (!folder)
            throw new common_1.NotFoundException('Qovluq tapılmadı!');
        const user = this.cls.get('user');
        if (user.role !== 'admin' && folder.ownerId !== userId) {
            throw new common_1.UnauthorizedException('Qovluğu yeniləmək üçün icazəniz yoxdur!');
        }
        const oldName = folder.name;
        const changes = {};
        if (dto.assigneeIds !== undefined) {
            const oldAssigneeIds = folder.assignees?.map(u => u.id) || [];
            const newAssigneeIds = dto.assigneeIds || [];
            const addedUserIds = newAssigneeIds.filter(id => !oldAssigneeIds.includes(id));
            const removedUserIds = oldAssigneeIds.filter(id => !newAssigneeIds.includes(id));
            for (const assigneeId of addedUserIds) {
                await this.notificationService.createNotification({
                    userId: assigneeId,
                    type: notification_entity_1.NotificationType.FOLDER_ASSIGNED,
                    title: 'Qovluğa əlavə edildiniz',
                    message: `"${folder.name}" qovluğuna əlavə edildiniz`,
                    folderId: folder.id
                });
            }
            for (const assigneeId of removedUserIds) {
                await this.notificationService.createNotification({
                    userId: assigneeId,
                    type: notification_entity_1.NotificationType.FOLDER_UNASSIGNED,
                    title: 'Qovluqdan çıxarıldınız',
                    message: `"${folder.name}" qovluğundan çıxarıldınız`,
                    folderId: folder.id
                });
            }
            if (addedUserIds.length || removedUserIds.length) {
                changes.assignees = { added: addedUserIds, removed: removedUserIds };
            }
            folder.assignees = newAssigneeIds.map(id => ({ id }));
        }
        if (dto.name)
            changes.name = { old: oldName, new: dto.name };
        if (dto.description !== undefined)
            changes.description = dto.description;
        Object.assign(folder, { name: dto.name, description: dto.description });
        await this.folderRepo.save(folder);
        await this.activityLogService.log(activity_log_entity_1.ActivityType.FOLDER_UPDATE, id, folder.name, `"${oldName}" qovluğu yeniləndi`, changes);
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
    __param(2, (0, typeorm_1.InjectRepository)(task_entity_1.TaskEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        assignee_defaults_service_1.AssigneeDefaultsService,
        nestjs_cls_1.ClsService,
        activity_log_service_1.ActivityLogService,
        notification_service_1.NotificationService])
], FolderService);
//# sourceMappingURL=folder.service.js.map