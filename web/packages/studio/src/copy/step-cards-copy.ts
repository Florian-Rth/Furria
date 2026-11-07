import { fineClockOf } from '@furria/studio/studio-copy';

export const STEP_CARDS_HISTORY = 'Rückgängig und Wiederholen';
export const STEP_CARDS_TRANSPORT = 'Wiedergabe';
export const STEP_CARDS_UNDO = 'Rückgängig';
export const STEP_CARDS_REDO = 'Wiederholen';
export const STEP_CARDS_MUSIC_PAGE = 'Musik & Video';
export const STEP_CARDS_PLAY = 'Abspielen';
export const STEP_CARDS_PAUSE = 'Anhalten';
export const STEP_CARDS_BACK = 'Voriger Schritt';
export const STEP_CARDS_FORWARD = 'Nächster Schritt';
export const STEP_CARDS_READOUT = 'Position';
export const STEP_CARD_STAGE = 'Bühne';
export const STEP_CARD_COUNTS = 'Zählzeiten dieses Schritts';
const COUNTS_PER_EIGHT = 8;

export const readoutCountOf = (eight: number | null, count: number | null): string =>
  eight === null || count === null ? '–' : `${eight} · ${count}`;

const countShapeOf = (counts: number): string => {
  const eights = Math.floor(counts / COUNTS_PER_EIGHT);
  const rest = counts % COUNTS_PER_EIGHT;
  const eightText = eights > 0 ? `${eights} Achter` : '';
  const restText = rest > 0 ? `${rest}` : '';

  return [eightText, restText].filter((part) => part !== '').join(' + ');
};

export const stepCardEyebrowOf = (
  number: number,
  total: number,
  part: string | null,
  counts: number,
): string => {
  const place = `Schritt ${number} von ${total}`;
  const named = part === null ? place : `${place} · ${part}`;

  return counts <= 0 ? named : `${named} · ${countShapeOf(counts)}`;
};

export const stepCardLabelOf = (number: number, total: number, name: string): string =>
  `Schritt ${number} von ${total}: ${name}`;

export const countCellLabelOf = (eight: number, count: number, seconds: number): string =>
  `Achter ${eight} · ${count} · ${fineClockOf(seconds)}: hierhin springen`;

export const stepDotNameOf = (name: string | null): string => name ?? 'frei';

export const stepDotLabelOf = (number: number, name: string | null): string =>
  `Platz ${number}, ${name ?? 'frei'}: wählen, ziehen oder Pfeiltasten`;

export const MUSIC_PAGE_TITLE = STEP_CARDS_MUSIC_PAGE;
export const MUSIC_PAGE_TABS = 'Musik oder Video';
export const MUSIC_PAGE_MUSIC = 'Musik';
export const MUSIC_PAGE_VIDEO = 'Video';
export const MUSIC_PAGE_LIST = 'Lieder, Endfassung und Videos';
export const MUSIC_PAGE_DENIED = 'Musik und Videos dieses Auftritts kannst du nicht bearbeiten.';
export const MUSIC_PAGE_CLOSED = 'Für diesen Auftritt gibt es noch keine Probe.';
