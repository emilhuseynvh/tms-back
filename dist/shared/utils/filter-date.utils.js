"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFilterDateBound = parseFilterDateBound;
exports.resolveFilterDateRange = resolveFilterDateRange;
exports.taskMatchesTaskDateFilters = taskMatchesTaskDateFilters;
exports.taskStartAtMatchesDateFilter = taskStartAtMatchesDateFilter;
function parseFilterDateBound(value, bound = 'start') {
    if (!value?.trim() || value.trim() === 'undefined')
        return null;
    const v = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
        const iso = bound === 'start'
            ? `${v}T00:00:00.000+04:00`
            : `${v}T23:59:59.999+04:00`;
        const d = new Date(iso);
        return isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
}
function resolveFilterDateRange(startDate, endDate) {
    let start = parseFilterDateBound(startDate, 'start');
    let end = parseFilterDateBound(endDate, 'end');
    if (start && end && start.getTime() > end.getTime()) {
        const tmp = start;
        start = end;
        end = tmp;
    }
    return { start, end };
}
function taskMatchesTaskDateFilters(task, startDate, endDate) {
    const { start: startBound, end: endBound } = resolveFilterDateRange(startDate, endDate);
    if (startBound) {
        if (!task.startAt)
            return false;
        const at = new Date(task.startAt);
        if (isNaN(at.getTime()) || at < startBound)
            return false;
    }
    if (endBound) {
        if (!task.dueAt)
            return false;
        const at = new Date(task.dueAt);
        if (isNaN(at.getTime()) || at > endBound)
            return false;
    }
    return true;
}
function taskStartAtMatchesDateFilter(startAt, startDate, endDate) {
    return taskMatchesTaskDateFilters({ startAt, dueAt: null }, startDate, endDate);
}
//# sourceMappingURL=filter-date.utils.js.map