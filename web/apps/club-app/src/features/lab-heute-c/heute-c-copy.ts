import type { WeiterKind } from './heute-c-view';

export const SCREEN_LABEL = 'Heute';
export const ON_STAGE = 'Auf der Bühne';
export const NEXT = 'Als Nächstes';
export const AFTER = 'Danach';
export const BEFORE_TITLE = 'Noch nicht begonnen';
export const ENDED_TITLE = 'Der Abend ist vorbei';
export const NOTHING_NEXT = 'Danach ist Schluss';
export const MISSING = 'Fehlt';
export const STAND_IN_MARK = 'springt ein';
export const CAST_LABEL = 'Besetzung';
export const CALL_TITLE = 'Rufen';
export const CALL_NONE = 'Gerade niemand zu rufen.';
export const CALL_LIST_LABEL = 'Leute für die nächsten Auftritte';
export const ON_STAGE_NOW = 'steht noch auf der Bühne';
export const BACK_LABEL = 'Einen Auftritt zurück';
export const OVERRUN = 'Die Regie ist inzwischen weitergegangen.';
export const FOLLOWING = 'Du folgst der Regie.';
export const ABLAUF_TITLE = 'Ablauf';
export const KEYS_LABEL = 'Regie';
export const CLOSE = 'Heute schließen';
export const LOADING = 'Abend wird geladen …';
export const LOAD_FAILED_TITLE = 'Abend nicht erreichbar';
export const LOAD_FAILED_TEXT = 'Dieser Abend konnte nicht geladen werden.';
export const NO_ORDER = 'Für diesen Abend steht noch kein Ablauf.';
export const DRAWER_CLOSE = 'Ablauf schließen';

const WEITER: Record<WeiterKind, string> = {
  start: 'Abend starten',
  next: 'Weiter',
  finish: 'Abend beenden',
  over: 'Vorbei',
};

export const toWeiterCaption = (kind: WeiterKind): string => WEITER[kind];

export const toHeading = (title: string | null): string =>
  title === null ? SCREEN_LABEL : `${SCREEN_LABEL} · ${title}`;

export const toEveningClock = (elapsed: string | null, ended: boolean): string => {
  if (elapsed === null) {
    return BEFORE_TITLE;
  }

  return ended ? `Vorbei nach ${elapsed}` : `Abend läuft ${elapsed}`;
};

export const toPosition = (number: number, total: number): string => `Nr. ${number} von ${total}`;

export const toAblaufOpen = (position: string | null, total: number): string =>
  position === null ? `${ABLAUF_TITLE} · ${total} Auftritte` : `${ABLAUF_TITLE} · ${position}`;

export const toAblaufEntry = (number: number, name: string): string => `${number}  ${name}`;

export const toPersonName = (firstName: string, lastName: string): string =>
  `${firstName} ${lastName.slice(0, 1)}.`;

export const toMissingLine = (names: readonly string[]): string =>
  `${MISSING}: ${names.join(', ')}`;

export const toCallMeta = (actName: string, onStageNow: boolean): string =>
  onStageNow ? `${actName} · ${ON_STAGE_NOW}` : actName;

export const toCallSpan = (number: number): string => `Nr. ${number}`;

export const toAfterLine = (name: string): string => `${AFTER}: ${name}`;

export const toBlockEyebrow = (eyebrow: string, position: string): string =>
  `${eyebrow} · ${position}`;

export const toOrderCount = (total: number): string => `${total} Auftritte im Ablauf`;
