import type { RunningOrderSummary } from '@/features/running-order/schemas';

const startOfDay = (now: Date): number =>
  new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

export const upcomingRunsOf = (
  summaries: readonly RunningOrderSummary[],
  now: Date,
): Map<number, number> => {
  const from = startOfDay(now);
  const runs = new Map<number, number>();

  for (const summary of summaries) {
    if (Date.parse(summary.startsAt) < from) {
      continue;
    }

    for (const actId of new Set(summary.actIds)) {
      runs.set(actId, (runs.get(actId) ?? 0) + 1);
    }
  }

  return runs;
};
