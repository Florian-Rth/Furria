export const DESK_LABEL = 'Auftritt bearbeiten';
export const DESK_BAR_LABEL = 'Wiedergabe und Werkzeuge';
export const DESK_TRANSPORT = 'Wiedergabe';
export const DESK_ZOOM = 'Zoom';
export const DESK_HISTORY_GROUP = 'Rückgängig, Wiederholen und Fertig';
export const DESK_PLAY = 'Abspielen';
export const DESK_PAUSE = 'Anhalten';
export const DESK_BACK = 'Voriger Schritt';
export const DESK_FORWARD = 'Nächster Schritt';
export const DESK_ZOOM_IN = 'Näher';
export const DESK_ZOOM_OUT = 'Weiter weg';
export const DESK_FIT = 'Ganzer Auftritt';
export const DESK_UNDO = 'Rückgängig';
export const DESK_REDO = 'Wiederholen';
export const DESK_DONE = 'Fertig';
export const DESK_DONE_LABEL = 'Bearbeiten beenden';
export const DESK_READOUT = 'Position';
export const DESK_MUSIC_PAGE = 'Musik & Video';
export const DESK_LANES = 'Spuren: Teile, Schritte, Musik, Video, Wege';
export const DESK_OVERVIEW = 'Ganzer Auftritt';
export const DESK_OVERVIEW_AIM = 'Ganzer Auftritt: tippen, um dorthin zu springen';
export const DESK_BRACKET =
  'Sichtbarer Ausschnitt: ziehen zum Verschieben, Ränder ziehen zum Zoomen, Pfeiltasten';
export const DESK_RULER = 'Zeit';
export const DESK_PARTS = 'Teile';
export const DESK_STEPS = 'Schritte';
export const DESK_MUSIC = 'Musik';
export const DESK_VIDEO = 'Video';
export const DESK_PATHS = 'Wege';
export const DESK_NONE = 'keine';
export const DESK_SEEK = 'Zeitleiste: tippen oder ziehen zum Spulen';
export const DESK_STAGE = 'Bühne';
export const DESK_STAGE_TOOLS = 'Bühne bearbeiten';
export const DESK_FORMATION = 'Aufstellung';
export const DESK_MOVEMENT = 'Wege';
export const DESK_MULTI = 'Mehrere';
export const DESK_ADD_SPOT = 'Platz';
export const DESK_ADD_SPOT_LABEL = 'Platz hinzufügen';
export const DESK_INSPECTOR = 'Auswahl';
export const DESK_TABS = 'Auswahl oder Verlauf';
export const DESK_TAB_SELECTION = 'Auswahl';
export const DESK_TAB_HISTORY = 'Verlauf';
export const DESK_ACTIONS = 'Aktionen';
export const DESK_HISTORY_EMPTY = 'In diesem Besuch noch nichts geändert.';
export const DESK_HISTORY_LIST = 'Änderungen in diesem Besuch';
export const DESK_NAME = 'Name';
export const DESK_DESCRIPTION = 'Beschreibung';
export const DESK_DESCRIPTION_PLACEHOLDER = 'Was passiert in diesem Schritt?';
export const DESK_SHORTER = 'Kürzer';
export const DESK_LONGER = 'Länger';
export const DESK_SHORTER_LABEL = 'Eine Zählzeit kürzer';
export const DESK_LONGER_LABEL = 'Eine Zählzeit länger';
export const DESK_MARK_HERE = 'Schritt hier';
export const DESK_MARK_HERE_LABEL = 'Neuen Schritt an der Abspielposition setzen';
export const DESK_NEW_PART = 'Teil ab hier';
export const DESK_LOOP = 'Schleife';
export const DESK_DELETE = 'Löschen';
export const DESK_DISSOLVE = 'Teil auflösen';
export const DESK_EARLIER = 'Früher';
export const DESK_LATER = 'Später';
export const DESK_EARLIER_COUNT = 'Eine Zählzeit früher';
export const DESK_LATER_COUNT = 'Eine Zählzeit später';
export const DESK_START_HERE = 'Hier beginnen';
export const DESK_MIRROR = 'Spiegeln';
export const DESK_LINE = 'Linie';
export const DESK_CIRCLE = 'Kreis';
export const DESK_BLOCK = 'Block';
export const DESK_ALIGN = 'Ausrichten';
export const DESK_ALIGN_DEEP = 'Ausrichten tief';
export const DESK_DISTRIBUTE = 'Verteilen';
export const DESK_COPY = 'Vom vorigen übernehmen';
export const DESK_STRAIGHT = 'Weg gerade';
export const DESK_TURN_LEFT = 'Links drehen';
export const DESK_TURN_RIGHT = 'Rechts drehen';
export const DESK_UNKEY = 'Zeitpunkt löschen';
export const DESK_NO_STEP =
  'Noch keine Schritte. Spiele die Musik ab und setze den ersten Schritt.';
export const DESK_NO_MUSIC = 'Noch keine Musik. Lade sie unter Musik & Video hoch.';
export const DESK_PICK_HINT =
  'Punkte auf der Bühne antippen, ziehen oder mit den Pfeiltasten schieben.';
export const DESK_ALL_SPOTS = 'Alle Plätze';
export const DESK_OPEN = 'offen';
export const DESK_FORMATION_GROUP = 'Aufstellung';

export const FACT_START = 'Beginn';
export const FACT_END = 'Ende';
export const FACT_LENGTH = 'Länge';
export const FACT_PART = 'Teil';
export const FACT_STEPS = 'Schritte';
export const FACT_PERSON = 'Person';
export const FACT_WHERE = 'Stelle';
export const FACT_KEYS = 'Zeitpunkte';
export const FACT_STATE = 'Stand';
export const FACT_FACING = 'Blick';
export const FACT_SPOTS = 'Plätze';

const TENTHS = 10;
const SECONDS_PER_MINUTE = 60;
const COUNTS_PER_EIGHT = 8;

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

export const amountOf = (count: number, one: string, many: string): string =>
  `${count} ${count === 1 ? one : many}`;

export const spotsAmountOf = (count: number): string => amountOf(count, 'Platz', 'Plätze');

export const stepsAmountOf = (count: number): string => amountOf(count, 'Schritt', 'Schritte');

export const keyLabelOf = (seconds: number, spots: number): string =>
  `Zeitpunkt ${clockOf(seconds)} · ${spotsAmountOf(spots)}: wählen, ziehen oder Pfeiltasten`;

export const keyEyebrowOf = (seconds: number): string => `Zeitpunkt ${clockOf(seconds)}`;

export const spotEyebrowOf = (count: number): string =>
  count === 1 ? 'Platz' : `${count} Plätze gewählt`;

export const spotTitleOf = (number: number, name: string | null): string =>
  name === null ? `Platz ${number}` : `${number} · ${name}`;

export const dotNameOf = (name: string | null): string => name ?? DESK_OPEN;

export const dotLabelOf = (number: number, name: string | null): string =>
  `Platz ${number}, ${name ?? DESK_OPEN}: wählen, ziehen oder Pfeiltasten`;

export const pointTextOf = (right: number, back: number): string =>
  `${right.toFixed(1).replace('.', ',')} m quer · ${back.toFixed(1).replace('.', ',')} m tief`;

export const facingTextOf = (degrees: number | null): string =>
  degrees === null ? 'nach vorn' : `${Math.round(degrees)} Grad`;

export const bracketTextOf = (start: number, end: number): string =>
  `${clockOf(start)} bis ${clockOf(end)}`;
