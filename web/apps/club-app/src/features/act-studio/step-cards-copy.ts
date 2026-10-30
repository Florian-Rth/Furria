import { fineClockOf } from './studio-copy';

export const STEP_CARDS_LABEL = 'Auftritt bearbeiten';
export const STEP_CARDS_HEAD = 'Werkzeuge';
export const STEP_CARDS_LIST = 'Schritte zum Wischen';
export const STEP_CARDS_HISTORY = 'Rückgängig und Wiederholen';
export const STEP_CARDS_TRANSPORT = 'Wiedergabe';
export const STEP_CARDS_UNDO = 'Rückgängig';
export const STEP_CARDS_REDO = 'Wiederholen';
export const STEP_CARDS_MUSIC_PAGE = 'Musik & Video';
export const STEP_CARDS_DONE = 'Fertig';
export const STEP_CARDS_DONE_LABEL = 'Fertig: Bearbeiten beenden';
export const STEP_CARDS_PLAY = 'Abspielen';
export const STEP_CARDS_PAUSE = 'Anhalten';
export const STEP_CARDS_BACK = 'Voriger Schritt';
export const STEP_CARDS_FORWARD = 'Nächster Schritt';
export const STEP_CARDS_READOUT = 'Position';
export const STEP_CARD_NAME = 'Name des Schritts';
export const STEP_CARD_STAGE = 'Bühne';
export const STEP_CARD_TOOLS = 'Bühne bearbeiten';
export const STEP_CARD_ACTIONS = 'Schritt';
export const STEP_CARD_COUNTS = 'Zählzeiten dieses Schritts';
export const STEP_CARD_MARK = 'Schritt hier';
export const STEP_CARD_MARK_LABEL = 'Schritt hier: neuen Schritt an der Abspielposition setzen';
export const STEP_CARD_STEP = 'Schritt …';
export const STEP_CARD_STEP_LABEL = 'Schritt: löschen oder Teil bilden';
export const STEP_TOOL_FORMATION = 'Aufstellung';
export const STEP_TOOL_MOVEMENT = 'Wege';
export const STEP_TOOL_MULTI = 'Mehrere';
export const STEP_TOOL_SPOTS = 'Plätze';
export const STEP_TOOL_SPOTS_LABEL = 'Plätze und Besetzung';
export const STEP_TOOL_ADD_SPOT = 'Platz';
export const STEP_TOOL_ADD_SPOT_LABEL = 'Platz hinzufügen';
export const STEP_TOOL_LINE = 'Linie';
export const STEP_TOOL_CIRCLE = 'Kreis';
export const STEP_TOOL_BLOCK = 'Block';
export const STEP_TOOL_MIRROR = 'Spiegeln';
export const STEP_TOOL_ALIGN = 'Ausrichten';
export const STEP_TOOL_ALIGN_DEEP = 'Ausrichten tief';
export const STEP_TOOL_DISTRIBUTE = 'Verteilen';
export const STEP_TOOL_COPY = 'Vom vorigen übernehmen';
export const STEP_TOOL_ONION = 'Vorher';
export const STEP_CARDS_EMPTY = 'Noch keine Schritte';
export const STEP_CARDS_NO_STEP = 'Spiele die Musik ab und setze an jeder Stelle einen Schritt.';
export const STEP_CARDS_NO_MUSIC =
  'Noch keine Musik. Lade zuerst unter Musik & Video ein Lied hoch.';

const COUNTS_PER_EIGHT = 8;

export const readoutCountOf = (eight: number | null, count: number | null): string =>
  eight === null || count === null ? '–' : `${eight} · ${count}`;

const countShapeOf = (counts: number): string => {
  const eights = Math.floor(counts / COUNTS_PER_EIGHT);
  const rest = counts % COUNTS_PER_EIGHT;
  const eightText = eights > 0 ? `${eights} × 8` : '';
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

export const stepDotNameOf = (name: string | null): string => name ?? 'offen';

export const stepDotLabelOf = (number: number, name: string | null): string =>
  `Platz ${number}, ${name ?? 'offen'}: wählen, ziehen oder Pfeiltasten`;

export const MUSIC_PAGE_TITLE = STEP_CARDS_MUSIC_PAGE;
export const MUSIC_PAGE_TABS = 'Musik oder Video';
export const MUSIC_PAGE_MUSIC = 'Musik';
export const MUSIC_PAGE_VIDEO = 'Video';
export const MUSIC_PAGE_LIST = 'Lieder, Endfassung und Videos';
export const MUSIC_PAGE_DENIED = 'Musik und Videos dieses Auftritts kannst du nicht bearbeiten.';
export const MUSIC_PAGE_CLOSED = 'Für diesen Auftritt gibt es noch keine Probe.';
