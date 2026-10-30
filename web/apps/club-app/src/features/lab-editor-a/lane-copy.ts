import type { SetupKey, SetupRow, SetupState } from './lane-setup';

export const LANE_FALLBACK_TITLE = 'Auftritt bearbeiten';
export const LANE_DENIED = 'Diesen Auftritt kannst du nicht bearbeiten.';
export const LANE_CLOSED = 'Für diesen Auftritt gibt es noch keine Probe.';
export const LANE_DESK_LABEL = 'Auftritt bearbeiten';
export const LANE_BAR_LABEL = 'Wiedergabe und Werkzeuge';
export const LANE_TRANSPORT = 'Wiedergabe';
export const LANE_ZOOM = 'Zoom';
export const LANE_HISTORY_GROUP = 'Rückgängig und Wiederholen';
export const LANE_PLAY = 'Abspielen';
export const LANE_PAUSE = 'Anhalten';
export const LANE_BACK = 'Voriger Schritt';
export const LANE_FORWARD = 'Nächster Schritt';
export const LANE_ZOOM_IN = 'Näher';
export const LANE_ZOOM_OUT = 'Weiter weg';
export const LANE_FIT = 'Ganzer Auftritt';
export const LANE_UNDO = 'Rückgängig';
export const LANE_REDO = 'Wiederholen';
export const LANE_READOUT = 'Position';
export const LANE_EYEBROW = 'Bearbeiten';
export const LANE_MUSIC_PAGE = 'Musik & Video';
export const LANE_LANES = 'Spuren: Teile, Schritte, Musik, Video, Wege';
export const LANE_RULER = 'Zeit';
export const LANE_PARTS = 'Teile';
export const LANE_STEPS = 'Schritte';
export const LANE_MUSIC = 'Musik';
export const LANE_VIDEO = 'Video';
export const LANE_PATHS = 'Wege';
export const LANE_NONE = 'keine';
export const LANE_SEEK = 'Zeitleiste: tippen oder ziehen zum Spulen';
export const LANE_STAGE = 'Bühne';
export const LANE_STAGE_TOOLS = 'Bühne bearbeiten';
export const LANE_FORMATION = 'Aufstellung';
export const LANE_MOVEMENT = 'Wege';
export const LANE_MULTI = 'Mehrere';
export const LANE_ADD_SPOT = 'Platz';
export const LANE_ADD_SPOT_LABEL = 'Platz hinzufügen';
export const LANE_INSPECTOR = 'Auswahl';
export const LANE_TABS = 'Auswahl oder Verlauf';
export const LANE_TAB_SELECTION = 'Auswahl';
export const LANE_TAB_HISTORY = 'Verlauf';
export const LANE_TAB_SETUP = 'Einrichten';
export const LANE_ACTIONS = 'Aktionen';
export const LANE_HISTORY_EMPTY = 'In diesem Besuch noch nichts geändert.';
export const LANE_HISTORY_LIST = 'Änderungen in diesem Besuch';
export const LANE_NAME = 'Name';
export const LANE_NAME_PLACEHOLDER = 'Name des Schritts';
export const LANE_DESCRIPTION = 'Beschreibung';
export const LANE_DESCRIPTION_PLACEHOLDER = 'Was passiert in diesem Schritt?';
export const LANE_PART_NAME_PLACEHOLDER = 'Name des Teils';
export const LANE_SHORTER = 'Kürzer';
export const LANE_LONGER = 'Länger';
export const LANE_SHORTER_LABEL = 'Eine Zählzeit kürzer';
export const LANE_LONGER_LABEL = 'Eine Zählzeit länger';
export const LANE_MARK_HERE = 'Schritt hier';
export const LANE_MARK_HERE_LABEL = 'Neuen Schritt an der Abspielposition setzen';
export const LANE_NEW_PART = 'Teil ab hier';
export const LANE_LOOP = 'Schleife';
export const LANE_DELETE = 'Löschen';
export const LANE_DISSOLVE = 'Teil auflösen';
export const LANE_EARLIER = 'Früher';
export const LANE_LATER = 'Später';
export const LANE_START_HERE = 'Hier beginnen';
export const LANE_MIRROR = 'Spiegeln';
export const LANE_LINE = 'Linie';
export const LANE_CIRCLE = 'Kreis';
export const LANE_BLOCK = 'Block';
export const LANE_ALIGN = 'Ausrichten';
export const LANE_ALIGN_DEEP = 'Ausrichten tief';
export const LANE_DISTRIBUTE = 'Verteilen';
export const LANE_COPY = 'Vom vorigen übernehmen';
export const LANE_STRAIGHT = 'Weg gerade';
export const LANE_TURN_LEFT = 'Links drehen';
export const LANE_TURN_RIGHT = 'Rechts drehen';
export const LANE_UNKEY = 'Zeitpunkt löschen';
export const LANE_NO_STEP =
  'Noch keine Schritte. Spiele die Musik ab und setze den ersten Schritt.';
export const LANE_NO_MUSIC = 'Noch keine Musik. Lade zuerst ein Lied hoch.';
export const LANE_PICK_HINT =
  'Punkte auf der Bühne antippen, ziehen oder mit den Pfeiltasten schieben.';
export const LANE_ALL_SPOTS = 'Alle Plätze';
export const LANE_OPEN_SPOT = 'offen';
export const LANE_CHECKLIST = 'Einrichten';
export const LANE_TO_EDITOR = 'Zum Bearbeiten';
export const LANE_CLOSE = 'Schließen';
export const LANE_CARDS = 'Schritte zum Wischen';
export const LANE_CARD_TOOLS = 'Aufstellung bearbeiten';
export const LANE_COUNTS = 'Zählzeiten dieses Schritts';
export const LANE_COUNTS_NONE = 'Keine Zählzeiten – erst Takt der Musik setzen.';
export const LANE_PHONE_HEAD = 'Werkzeuge';
export const LANE_EMPTY_CARD = 'Noch keine Schritte';
export const LANE_SONG_ACCEPT = 'audio/*';
export const LANE_VIDEO_ACCEPT = 'video/*';
export const LANE_MUSIC_TABS = 'Musik oder Video';
export const LANE_UPLOADING = 'Lädt hoch';

export const FACT_START = 'Beginn';
export const FACT_END = 'Ende';
export const FACT_LENGTH = 'Länge';
export const FACT_PART = 'Teil';
export const FACT_STEPS = 'Schritte';
export const FACT_PLACE = 'Platz';
export const FACT_PERSON = 'Person';
export const FACT_WHERE = 'Stelle';
export const FACT_KEYS = 'Zeitpunkte';
export const FACT_STATE = 'Stand';
export const FACT_FACING = 'Blick';
export const FACT_SPOTS = 'Plätze';

const TENTHS = 10;
const SECONDS_PER_MINUTE = 60;
const COUNTS_PER_EIGHT = 8;
const DEGREES = 'Grad';

export const clockOf = (seconds: number): string => {
  const tenths = Math.round(Math.max(0, seconds) * TENTHS);
  const minutes = Math.floor(tenths / (SECONDS_PER_MINUTE * TENTHS));
  const rest = (tenths % (SECONDS_PER_MINUTE * TENTHS)) / TENTHS;
  const [whole, fraction = '0'] = rest.toFixed(1).split('.');

  return `${minutes}:${(whole ?? '0').padStart(2, '0')},${fraction}`;
};

export const countShapeOf = (counts: number): string => {
  const eights = Math.floor(counts / COUNTS_PER_EIGHT);
  const rest = counts % COUNTS_PER_EIGHT;
  const eightText = eights > 0 ? `${eights} × 8` : '';
  const restText = rest > 0 ? `${rest}` : '';

  return [eightText, restText].filter((part) => part !== '').join(' + ');
};

export const countLengthOf = (counts: number): string => {
  const shape = countShapeOf(counts);

  return `${counts} Zählzeiten${shape === '' ? '' : ` · ${shape}`}`;
};

export const countPlaceTextOf = (eight: number, count: number): string =>
  `Achter ${eight} · ${count}`;

export const readoutCountOf = (eight: number | null, count: number | null): string =>
  eight === null || count === null ? '–' : `${eight} · ${count}`;

export const snapHintOf = (eight: number | null, count: number | null, seconds: number): string =>
  eight === null || count === null
    ? clockOf(seconds)
    : `${countPlaceTextOf(eight, count)} · ${clockOf(seconds)}`;

export const stepEyebrowOf = (number: number, total: number, part: string | null): string =>
  part === null ? `Schritt ${number} von ${total}` : `Schritt ${number} von ${total} · ${part}`;

export const stepBlockLabelOf = (number: number, name: string, current: boolean): string =>
  `Schritt ${number}: ${name}${current ? ' (läuft)' : ''}`;

export const partBlockLabelOf = (name: string, first: number, last: number): string =>
  `Teil ${name}, Schritt ${first} bis ${last}`;

export const partEyebrowOf = (first: number, last: number): string =>
  `Teil · Schritt ${first}–${last}`;

export const partStepsOf = (first: number, last: number, count: number): string =>
  `${first}–${last} · ${count} Schritte`;

export const newPartNameOf = (number: number): string => `Teil ${number}`;

export const borderLabelOf = (before: string, after: string): string =>
  `Grenze zwischen ${before} und ${after}: ziehen oder Pfeiltasten`;

export const videoBlockLabelOf = (name: string): string => `Video ${name}: wählen und ziehen`;

export const videoEyebrowOf = (number: number): string => `Video ${number}`;

export const keyLabelOf = (seconds: number, spots: number): string =>
  `Zeitpunkt ${clockOf(seconds)} · ${spots} ${spots === 1 ? 'Platz' : 'Plätze'}`;

export const keyEyebrowOf = (seconds: number): string => `Zeitpunkt ${clockOf(seconds)}`;

export const spotEyebrowOf = (count: number): string =>
  count === 1 ? 'Platz' : `${count} Plätze gewählt`;

export const spotTitleOf = (number: number, name: string | null): string =>
  name === null ? `Platz ${number}` : `${number} · ${name}`;

export const dotNameOf = (name: string | null): string => name ?? LANE_OPEN_SPOT;

export const dotLabelOf = (number: number, name: string | null): string =>
  `Platz ${number}, ${name ?? 'offen'}: wählen, ziehen oder Pfeiltasten`;

export const pointTextOf = (right: number, back: number): string =>
  `${right.toFixed(1).replace('.', ',')} m quer · ${back.toFixed(1).replace('.', ',')} m tief`;

export const facingTextOf = (degrees: number | null): string =>
  degrees === null ? 'nach vorn' : `${Math.round(degrees)} ${DEGREES}`;

export const amountOf = (count: number, one: string, many: string): string =>
  `${count} ${count === 1 ? one : many}`;

export const progressTextOf = (done: number, total: number): string => `${done}/${total}`;

export const progressLabelOf = (done: number, total: number): string =>
  `Einrichten: ${done} von ${total} erledigt`;

export const cardLabelOf = (number: number, total: number, name: string): string =>
  `Schritt ${number} von ${total}: ${name}`;

export const cardEyebrowOf = (number: number, total: number, part: string | null): string =>
  stepEyebrowOf(number, total, part);

export const eightTextOf = (eight: number): string => `Achter ${eight}`;

export const countCellLabelOf = (eight: number, count: number): string =>
  `Zu ${countPlaceTextOf(eight, count)} springen`;

export const SETUP_TITLES: Record<SetupKey, string> = {
  music: 'Musik',
  steps: 'Schritte',
  spots: 'Plätze',
  formation: 'Aufstellung',
  video: 'Video',
  final: 'Endfassung',
};

export const SETUP_ACTIONS: Record<SetupKey, string> = {
  music: 'Lied hochladen',
  steps: 'Schritt setzen',
  spots: 'Platz hinzufügen',
  formation: 'Aufstellen',
  video: 'Video hochladen',
  final: 'Endfassung',
};

export const SETUP_STATES: Record<SetupState, string> = {
  done: 'erledigt',
  next: 'als Nächstes',
  open: 'offen',
};

export const setupFactOf = (row: SetupRow): string => {
  switch (row.key) {
    case 'music':
      return row.amount === 0
        ? 'Noch kein Lied – Lieder werden zu einer Mischung geschnitten.'
        : `${amountOf(row.amount, 'Lied', 'Lieder')} in der Mischung`;
    case 'steps':
      return row.amount === 0
        ? 'Musik abspielen und an jeder Stelle einen Schritt setzen.'
        : `${amountOf(row.amount, 'Schritt', 'Schritte')} gesetzt`;
    case 'spots':
      return row.amount === 0
        ? 'Für jede Tänzerin einen Platz auf der Bühne.'
        : `${amountOf(row.amount, 'Platz', 'Plätze')}, davon ${row.open} offen`;
    case 'formation':
      return row.amount === 0
        ? 'Plätze für den ersten Schritt auf die Bühne ziehen.'
        : `${amountOf(row.amount, 'Platz', 'Plätze')} aufgestellt, ${row.open} noch ohne Stelle`;
    case 'video':
      return row.amount === 0
        ? 'Ein Probevideo zum Mitlernen hochladen.'
        : `${amountOf(row.amount, 'Video', 'Videos')}`;
    case 'final':
      return row.amount === 0
        ? 'Die fertig geschnittene Musik, wenn sie da ist.'
        : `${amountOf(row.amount, 'Fassung', 'Fassungen')}, ${row.open} wartet`;
  }
};

export const uploadFactOf = (name: string, share: number): string =>
  `${LANE_UPLOADING}: ${name} · ${Math.round(share * 100)} %`;

export const cardMetaOf = (eyebrow: string, counts: number): string =>
  counts <= 0 ? eyebrow : `${eyebrow} · ${countShapeOf(counts)}`;
