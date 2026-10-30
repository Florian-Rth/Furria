import type { LiveState } from '@/features/live/live-flow';

export const HEUTE_LABEL = 'Heute';
export const STRIP_LABEL = 'Ablauf des Abends';
export const CLOSE_LABEL = 'Heute schließen';
export const NOW_TITLE = 'Auf der Bühne';
export const NEXT_TITLE = 'Als Nächstes';
export const AFTER_TITLE = 'Danach';
export const CALL_TITLE = 'Jetzt rufen';
export const CALL_NONE = 'Niemand zu rufen.';
export const ON_STAGE_CHIP = 'noch auf der Bühne';
export const MISSING_TITLE = 'Fehlt';
export const STANDS_IN_TITLE = 'Springt ein';
export const NOBODY_MISSING = 'Alle da';
export const KEYS_LABEL = 'Regie';
export const BACK_CAPTION = 'Zurück';
export const BACK_LABEL = 'Einen Auftritt zurück';
export const START_CAPTION = 'Abend starten';
export const FORWARD_CAPTION = 'Weiter';
export const FINISH_CAPTION = 'Abend beenden';
export const ENDED_CAPTION = 'Zu Ende';
export const FOLLOWING_NOTE = 'Du folgst der Regie. Die Anzeige läuft von selbst mit.';
export const BEFORE_TITLE = 'Der Abend hat noch nicht begonnen';
export const ENDED_TITLE = 'Der Abend ist zu Ende';
export const NO_LINES = 'Für diesen Abend steht noch kein Ablauf.';
export const LOAD_FAILED = 'Der Abend konnte nicht geladen werden.';
export const CONFLICT_MESSAGE = 'Die Regie ist inzwischen weitergegangen.';
export const MOVE_FAILED = 'Das hat nicht geklappt.';
export const NOT_FOUND = 'Diesen Abend gibt es nicht.';
export const ACT_ELAPSED_LABEL = 'Auftritt läuft seit';
export const EVENING_ELAPSED_LABEL = 'Abend läuft seit';

export const toNumberText = (number: number, total: number): string => `Nr. ${number} von ${total}`;

export const toCallGroupTitle = (number: number, name: string): string => `Nr. ${number} · ${name}`;

export const toCallCount = (count: number): string => (count === 1 ? '1 Person' : `${count} Leute`);

export const toForwardCaption = (state: LiveState, hasNext: boolean): string => {
  if (state === 'before') {
    return START_CAPTION;
  }
  if (state === 'ended') {
    return ENDED_CAPTION;
  }

  return hasNext ? FORWARD_CAPTION : FINISH_CAPTION;
};

export const toPersonName = (firstName: string, lastName: string): string => {
  const [initial] = lastName.trim();

  return initial === undefined ? firstName : `${firstName} ${initial}.`;
};

export const toBlockEyebrow = (title: string, number: number, total: number): string =>
  `${title} · ${toNumberText(number, total)}`;

export const toAfterLine = (number: number, name: string): string =>
  `${AFTER_TITLE}: Nr. ${number} · ${name}`;

export const toForwardHint = (
  state: LiveState,
  nextNumber: number | null,
  nextName: string | null,
): string | null => {
  if (state === 'ended') {
    return null;
  }
  if (nextNumber === null || nextName === null) {
    return 'Weiter beendet den Abend.';
  }

  return state === 'before'
    ? `Startet mit Nr. ${nextNumber} · ${nextName}`
    : `Weiter holt Nr. ${nextNumber} · ${nextName} auf die Bühne`;
};
