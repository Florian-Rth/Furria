export type HistoryStack = 'document' | 'visit';

export interface HistoryTops {
  document: number | null;
  visit: number | null;
}

const pickedOf = (
  { document, visit }: HistoryTops,
  documentWins: (documentAt: number, visitAt: number) => boolean,
): HistoryStack | null => {
  if (document === null) {
    return visit === null ? null : 'visit';
  }

  return visit === null || documentWins(document, visit) ? 'document' : 'visit';
};

const isAfter = (at: number | null, redoAt: number | null): boolean =>
  at !== null && redoAt !== null && at > redoAt;

export const undoStackOf = (tops: HistoryTops): HistoryStack | null =>
  pickedOf(tops, (documentAt, visitAt) => documentAt >= visitAt);

export const redoStackOf = (redos: HistoryTops, undos: HistoryTops): HistoryStack | null =>
  pickedOf(
    {
      document: isAfter(undos.visit, redos.document) ? null : redos.document,
      visit: isAfter(undos.document, redos.visit) ? null : redos.visit,
    },
    (documentAt, visitAt) => documentAt <= visitAt,
  );
