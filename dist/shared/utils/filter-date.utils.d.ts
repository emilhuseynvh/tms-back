export declare function parseFilterDateBound(value?: string, bound?: 'start' | 'end'): Date | null;
export type DateRangeBounds = {
    start: Date | null;
    end: Date | null;
};
export declare function resolveFilterDateRange(startDate?: string, endDate?: string): DateRangeBounds;
export declare function taskMatchesTaskDateFilters(task: {
    startAt?: Date | string | null;
    dueAt?: Date | string | null;
}, startDate?: string, endDate?: string): boolean;
export declare function taskStartAtMatchesDateFilter(startAt: Date | string | null | undefined, startDate?: string, endDate?: string): boolean;
