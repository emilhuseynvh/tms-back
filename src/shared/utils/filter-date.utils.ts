/**
 * Filtr tarixləri: Bakı təqvim günü (YYYY-MM-DD) və ya UTC ISO.
 */
export function parseFilterDateBound(
	value?: string,
	bound: 'start' | 'end' = 'start',
): Date | null {
	if (!value?.trim() || value.trim() === 'undefined') return null
	const v = value.trim()

	if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
		const iso =
			bound === 'start'
				? `${v}T00:00:00.000+04:00`
				: `${v}T23:59:59.999+04:00`
		const d = new Date(iso)
		return isNaN(d.getTime()) ? null : d
	}

	const d = new Date(v)
	return isNaN(d.getTime()) ? null : d
}

export type DateRangeBounds = { start: Date | null; end: Date | null }

/** startDate + endDate → Bakı günü sərhədləri; start > end olsa avtomatik dəyişir. */
export function resolveFilterDateRange(
	startDate?: string,
	endDate?: string,
): DateRangeBounds {
	let start = parseFilterDateBound(startDate, 'start')
	let end = parseFilterDateBound(endDate, 'end')

	if (start && end && start.getTime() > end.getTime()) {
		const tmp = start
		start = end
		end = tmp
	}

	return { start, end }
}

/** Başlama → startAt, Bitmə → dueAt */
export function taskMatchesTaskDateFilters(
	task: {
		startAt?: Date | string | null
		dueAt?: Date | string | null
	},
	startDate?: string,
	endDate?: string,
): boolean {
	const { start: startBound, end: endBound } = resolveFilterDateRange(startDate, endDate)

	if (startBound) {
		if (!task.startAt) return false
		const at = new Date(task.startAt)
		if (isNaN(at.getTime()) || at < startBound) return false
	}

	if (endBound) {
		if (!task.dueAt) return false
		const at = new Date(task.dueAt)
		if (isNaN(at.getTime()) || at > endBound) return false
	}

	return true
}

/** @deprecated taskMatchesTaskDateFilters istifadə edin */
export function taskStartAtMatchesDateFilter(
	startAt: Date | string | null | undefined,
	startDate?: string,
	endDate?: string,
): boolean {
	return taskMatchesTaskDateFilters({ startAt, dueAt: null }, startDate, endDate)
}
