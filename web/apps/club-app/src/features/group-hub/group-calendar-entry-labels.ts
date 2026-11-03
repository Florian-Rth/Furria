export const CALENDAR_ENTRY_EMPTY_TITLE = 'NICHTS GEPLANT';
export const CALENDAR_ENTRY_EMPTY_LINE = 'In den kommenden Monaten sind keine Termine geplant.';
export const CALENDAR_ENTRY_ERROR_TITLE = 'TERMINE NICHT GELADEN';
export const CALENDAR_ENTRY_RETRY_LABEL = 'Noch einmal';
export const PLAN_TRAINING_LABEL = 'Training';
export const PLAN_TRAINING_ACTION_LABEL = 'Training planen';
export const ALL_ENTRIES_LABEL = 'Alle Termine';

export const toMoreEntriesMeta = (moreCount: number): string =>
  moreCount === 1 ? '1 weiterer Termin im Kalender' : `${moreCount} weitere Termine im Kalender`;

export const toMoreOwedHint = (moreOwedCount: number): string | undefined =>
  moreOwedCount === 0 ? undefined : `${moreOwedCount} ohne Antwort`;
