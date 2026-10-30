import { fineClockOf } from '@/features/act-studio/studio-copy';
import type { Studio } from '@/features/acts/schemas';
import type { SheetDensity } from './count-sheet';
import type { SetupItem, SetupItemKey, SetupState } from './setup-progress';

export const EIGHTS_FALLBACK_TITLE = 'Auftritt bearbeiten';
export const EIGHTS_DENIED = 'Du darfst diesen Auftritt nicht bearbeiten.';
export const EIGHTS_CLOSED = 'Für diesen Auftritt gibt es noch nichts zu bearbeiten.';
export const EIGHTS_FRAME_LABEL = 'Auftritt bearbeiten';
export const EIGHTS_BAR_LABEL = 'Werkzeuge';
export const EIGHTS_SHEET_LABEL = 'Achter der Musik, Zeile für Zeile';
export const EIGHTS_NO_COUNTS = 'Keine Zählzeiten – die Musik hat noch keinen erkannten Takt.';
export const EIGHTS_PART = 'Teil';
export const EIGHTS_STEP = 'Schritt';
export const EIGHTS_VIDEO = 'Video';
export const EIGHTS_WAYS = 'Wege';
export const EIGHTS_PICKUP = 'Auftakt';

export const EIGHTS_UNDO = 'Rückgängig';
export const EIGHTS_REDO = 'Wiederholen';
export const EIGHTS_HISTORY = 'Verlauf';
export const EIGHTS_HISTORY_CLOSE = 'Verlauf schließen';
export const EIGHTS_MUSIC_VIDEO = 'Musik & Video';
export const EIGHTS_SETUP = 'Einrichtung';
export const EIGHTS_SETUP_CLOSE = 'Einrichtung schließen';
export const EIGHTS_ZOOM_LABEL = 'Achter pro Zeile';
export const EIGHTS_TRANSPORT = 'Abspielen';
export const EIGHTS_BACK = 'Voriger Schritt';
export const EIGHTS_FORWARD = 'Nächster Schritt';
export const EIGHTS_PLAY = 'Abspielen';
export const EIGHTS_PAUSE = 'Anhalten';

export const ZOOM_OPTIONS: readonly { key: SheetDensity; text: string; label: string }[] = [
  { key: 'half', text: '½', label: 'Ein halber Achter pro Zeile' },
  { key: 'eight', text: '1', label: 'Ein Achter pro Zeile' },
  { key: 'two', text: '2', label: 'Zwei Achter pro Zeile' },
  { key: 'all', text: 'Alles', label: 'Ganzer Auftritt, vier Achter pro Zeile' },
];

export const EIGHTS_STRIP_LABEL = 'Gewählter Schritt';
export const EIGHTS_NO_STEP = 'Kein Schritt';
export const EIGHTS_NO_STEP_META = 'Setze den ersten Schritt mit „Neuer Schritt hier“.';
export const EIGHTS_NO_PART = 'Ohne Teil';
export const EIGHTS_MARK_HERE = 'Neuer Schritt hier';
export const EIGHTS_REMOVE_STEP = 'Schritt entfernen';
export const EIGHTS_NAME_LABEL = 'Name des Schritts';
export const EIGHTS_NAME_PLACEHOLDER = 'Name';
export const EIGHTS_STEP_TOOLS = 'Schritt bearbeiten';
export const EIGHTS_STAGE_TOOLS = 'Aufstellung bearbeiten';
export const EIGHTS_FORMATION = 'Aufstellung';
export const EIGHTS_MOVES = 'Wege';
export const EIGHTS_LINE = 'Linie';
export const EIGHTS_BLOCK = 'Block';
export const EIGHTS_CIRCLE = 'Kreis';
export const EIGHTS_MIRROR = 'Spiegeln';
export const EIGHTS_ALIGN_ROW = 'In eine Reihe';
export const EIGHTS_ALIGN_COLUMN = 'Hintereinander';
export const EIGHTS_SPREAD = 'Gleich verteilen';
export const EIGHTS_COPY = 'Vom vorigen übernehmen';
export const EIGHTS_MULTI = 'Mehrere';
export const EIGHTS_ONION = 'Vorher';
export const EIGHTS_ADD_SPOT = 'Platz hinzufügen';
export const EIGHTS_STAGE_LABEL = 'Bühne: Punkte antippen und ziehen, Pfeiltasten verschieben';
export const EIGHTS_FRONT = 'Publikum';

export const EIGHTS_REEL_LABEL = 'Schritte, nach oben und unten wischen';
export const EIGHTS_CARD_COUNTS = 'Zählzeiten des Schritts';
export const EIGHTS_NO_STEPS = 'Noch keine Schritte.';

export const EIGHTS_MUSIC_TAB = 'Musik';
export const EIGHTS_VIDEO_TAB = 'Video';
export const EIGHTS_MUSIC_TABS = 'Musik oder Video';

const clockOf = (seconds: number): string => fineClockOf(seconds);

export const timeTextOf = (seconds: number): string => clockOf(seconds);

export const eightTextOf = (eight: number | null): string => (eight === null ? '–' : `A${eight}`);

export const countTextOf = (count: number | null): string => (count === null ? '–' : String(count));

export const clockLabelOf = (
  seconds: number,
  eight: number | null,
  count: number | null,
): string =>
  eight === null || count === null
    ? `Zeit ${clockOf(seconds)}`
    : `Zeit ${clockOf(seconds)}, Achter ${eight}, Zählzeit ${count}`;

export const countLabelOf = (eight: number, count: number, seconds: number): string =>
  `Achter ${eight}, Zählzeit ${count}, ${clockOf(seconds)}: hierhin springen`;

export const rowLabelOf = (eight: number | null, seconds: number): string =>
  eight === null ? `${EIGHTS_PICKUP}, ${clockOf(seconds)}` : `Achter ${eight}, ${clockOf(seconds)}`;

export const edgeLabelOf = (number: number, name: string): string =>
  `Grenze vor Schritt ${number} „${name}“ – ziehen oder Pfeiltasten`;

export const edgeValueOf = (seconds: number, eight: number, count: number): string =>
  `Achter ${eight}, Zählzeit ${count}, ${clockOf(seconds)}`;

export const gripLabelOf = (name: string): string =>
  `Beginn von Teil „${name}“ verschieben – ziehen oder Pfeil hoch/runter`;

export const stepLeadOf = (number: number): string => String(number);

export const moreStepsOf = (name: string, more: number): string =>
  more > 0 ? `${name} +${more}` : name;

export const waysTextOf = (moving: number): string | null => (moving > 0 ? String(moving) : null);

export const stripEyebrowOf = (partName: string | null): string =>
  partName === null ? EIGHTS_NO_PART : `${EIGHTS_PART} ${partName}`;

export const stripMetaOf = (
  eights: number,
  start: number,
  end: number,
  selection: string,
): string => `${eights} Achter · ${clockOf(start)}–${clockOf(end)} · ${selection}`;

export const cardMetaOf = (eights: number, start: number, end: number): string =>
  `${eights} Achter · ${clockOf(start)}–${clockOf(end)}`;

export const cardLabelOf = (number: number, name: string): string => `Schritt ${number}: ${name}`;

export const progressTextOf = (done: number, total: number): string => `${done}/${total}`;

export const progressLabelOf = (done: number, total: number): string =>
  `${EIGHTS_SETUP}: ${done} von ${total} erledigt – öffnen`;

export const musicTitleOf = (actName: string): string => `${actName} · ${EIGHTS_MUSIC_VIDEO}`;

export interface SetupCopy {
  text: string;
  title: string;
  lead: string;
  action: string;
  locked: string;
}

export const SETUP_COPY: Record<SetupItemKey, SetupCopy> = {
  music: {
    text: 'Musik',
    title: 'Musik hinzufügen',
    lead: 'Lade die Lieder hoch. Takt und Zählzeiten werden erkannt – danach stehen die Achter Zeile für Zeile bereit.',
    action: 'Lieder auswählen',
    locked: '',
  },
  steps: {
    text: 'Schritte',
    title: 'Ersten Schritt setzen',
    lead: 'Der erste Schritt beginnt auf der ersten Eins. Weitere setzt du in den Achtern mit „Neuer Schritt hier“.',
    action: 'Schritt auf die Eins',
    locked: 'Braucht Musik',
  },
  spots: {
    text: 'Plätze',
    title: 'Plätze anlegen',
    lead: 'Ein Platz pro Tänzerin. Wer welchen Platz tanzt, legst du in der Besetzung fest.',
    action: 'Platz hinzufügen',
    locked: '',
  },
  formation: {
    text: 'Aufstellung',
    title: 'Erste Aufstellung stellen',
    lead: 'Alle Plätze kommen in eine Linie. Zieh sie danach auf der Bühne an ihren Platz.',
    action: 'Alle in eine Linie',
    locked: 'Braucht Plätze und Schritte',
  },
  video: {
    text: 'Video',
    title: 'Probenvideo anlegen',
    lead: 'Ein Video der Probe läuft beim Üben neben der Bühne mit.',
    action: 'Video hinzufügen',
    locked: 'Braucht Musik',
  },
  final: {
    text: 'Endfassung',
    title: 'Endfassung einspielen',
    lead: 'Die fertige Musik vom Tonstudio ersetzt die Lieder. Schritte und Wege wandern mit.',
    action: 'Zur Endfassung',
    locked: 'Braucht Musik',
  },
};

export const SETUP_WAITING_LEAD =
  'Die Endfassung ist hochgeladen und wartet darauf, übernommen zu werden.';

export const SETUP_STATE_TEXT: Record<SetupState, string> = {
  done: 'erledigt',
  open: 'offen',
  waiting: 'wartet',
  locked: 'gesperrt',
};

export const nextEyebrowOf = (position: number, total: number): string =>
  `Als Nächstes · ${position} von ${total}`;

export const SETUP_ALL_DONE = 'Alles eingerichtet';
export const SETUP_RAIL_LABEL = 'Fortschritt der Einrichtung';
export const SETUP_LIST_LABEL = 'Alle Punkte der Einrichtung';
export const SETUP_GO = 'Öffnen';
export const EIGHTS_EDIT_ORIGIN = 'Bearbeiten';

const plural = (count: number, one: string, many: string): string =>
  `${count} ${count === 1 ? one : many}`;

export const setupMetaOf = (studio: Studio, item: SetupItem): string => {
  if (item.state === 'locked') {
    return SETUP_COPY[item.key].locked;
  }
  if (item.state === 'waiting') {
    return 'hochgeladen, noch nicht übernommen';
  }
  if (item.state === 'open') {
    return 'noch nichts da';
  }
  switch (item.key) {
    case 'music':
      return `${plural(studio.songs.length, 'Lied', 'Lieder')} · ${clockOf(studio.music.lengthSeconds)}`;
    case 'steps':
      return `${plural(studio.steps.length, 'Schritt', 'Schritte')} in ${plural(studio.parts.length, 'Teil', 'Teilen')}`;
    case 'spots':
      return `${plural(studio.spots.length, 'Platz', 'Plätze')}, ${studio.spots.filter((spot) => spot.person === null).length} offen`;
    case 'formation':
      return plural(
        studio.choreography?.tracks.reduce((sum, track) => sum + track.keyframes.length, 0) ?? 0,
        'Wegpunkt',
        'Wegpunkte',
      );
    case 'video':
      return plural(studio.videos.length, 'Video', 'Videos');
    default:
      return 'übernommen';
  }
};
