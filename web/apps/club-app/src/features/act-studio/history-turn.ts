import type { SaveStatus } from '@furria/studio/autosave';
import type { ChangeKind, HistoryRecord } from '@furria/studio/edit-history';

export interface HistoryTop {
  key: string;
  undoAt: number | null;
  redoAt: number | null;
}

const isLater = (at: number | null, than: number): boolean => at !== null && at > than;

export const undoTurnOf = (tops: readonly HistoryTop[]): string | null =>
  tops.reduce<HistoryTop | null>(
    (newest, top) =>
      isLater(top.undoAt, newest?.undoAt ?? Number.NEGATIVE_INFINITY) ? top : newest,
    null,
  )?.key ?? null;

export const redoTurnOf = (tops: readonly HistoryTop[]): string | null => {
  const open = tops.filter(
    (top) =>
      top.redoAt !== null &&
      !tops.some((other) => other.key !== top.key && isLater(other.undoAt, top.redoAt ?? 0)),
  );

  return (
    open.reduce<HistoryTop | null>(
      (oldest, top) => (oldest === null || (top.redoAt ?? 0) < (oldest.redoAt ?? 0) ? top : oldest),
      null,
    )?.key ?? null
  );
};

export const combinedStatusOf = (statuses: readonly SaveStatus[]): SaveStatus | null => {
  if (statuses.length === 0) {
    return null;
  }
  if (statuses.includes('failed')) {
    return 'failed';
  }

  return statuses.includes('saving') ? 'saving' : 'saved';
};

export interface HistorySource {
  key: string;
  eventId: number | null;
  records: readonly HistoryRecord[];
}

export interface HistoryLine {
  key: string;
  kind: ChangeKind;
  eventId: number | null;
  at: number;
  undone: boolean;
}

export const historyLinesOf = (sources: readonly HistorySource[]): HistoryLine[] =>
  sources
    .flatMap(({ key, eventId, records }) =>
      records.flatMap((record): HistoryLine[] => {
        const [kind] = record.kinds;

        return kind === undefined
          ? []
          : [
              {
                key: `${key}:${record.at}:${record.undone ? 'undone' : 'done'}`,
                kind,
                eventId,
                at: record.at,
                undone: record.undone,
              },
            ];
      }),
    )
    .sort((left, right) => Number(right.undone) - Number(left.undone) || right.at - left.at);
