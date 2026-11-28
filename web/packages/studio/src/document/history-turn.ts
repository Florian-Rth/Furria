import type { ChangeKind, HistoryRecord } from '@furria/studio/edit-history';

export interface HistoryLine {
  key: string;
  kind: ChangeKind;
  at: number;
  undone: boolean;
}

export const historyLinesOf = (records: readonly HistoryRecord[]): HistoryLine[] =>
  records
    .flatMap((record): HistoryLine[] => {
      const [kind] = record.kinds;

      return kind === undefined
        ? []
        : [
            {
              key: `${record.at}:${record.undone ? 'undone' : 'done'}`,
              kind,
              at: record.at,
              undone: record.undone,
            },
          ];
    })
    .sort((left, right) => Number(right.undone) - Number(left.undone) || right.at - left.at);
