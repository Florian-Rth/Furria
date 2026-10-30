import type { KeyframeEasing } from '@/features/act-player/choreography-motion';
import type { CountReading } from './studio-g-timeline';

const SECONDS_PER_MINUTE = 60;
const TENTHS = 10;
const FULL_TURN = 360;

export const STUDIO_G_FALLBACK_TITLE = 'Auftritt';
export const STUDIO_G_DENIED = 'Diesen Auftritt kannst du nicht öffnen.';
export const STUDIO_G_CLOSED = 'Für diesen Auftritt gibt es noch keine Musik und keine Schritte.';
export const STUDIO_G_EDIT = 'Bearbeiten';
export const STUDIO_G_DONE = 'Fertig';
export const STUDIO_G_DESK = 'Auftritt bearbeiten';

export const VIEWER_LABEL = 'Bühne und Trainervideo';
export const VIEWER_STAGE = 'Bühne';
export const VIEWER_VIDEO = 'Trainervideo';
export const VIEWER_SHOW_STAGE = 'Bühne groß zeigen';
export const VIEWER_SHOW_VIDEO = 'Video groß zeigen';
export const VIEWER_SIGHT = 'Sicht auf die Bühne';
export const SIGHT_AUDIENCE = 'Publikum';
export const SIGHT_DANCERS = 'Tänzer';
export const STAGE_FRONT = 'Publikum';
export const STAGE_FROM_AUDIENCE = 'Bühne von vorne, das Publikum unten';
export const STAGE_FROM_DANCERS = 'Bühne aus Sicht der Tänzer, das Publikum oben';
export const NO_VIDEO_HERE = 'Kein Video an dieser Stelle';
export const NO_VIDEO_EYEBROW = 'ohne Video';

export const TRANSPORT_LABEL = 'Abspielen und bearbeiten';
export const PREVIOUS_STEP = 'Vorheriger Schritt';
export const NEXT_STEP = 'Nächster Schritt';
export const LOOP_SELECTION = 'Auswahl wiederholen';
export const LOOP_STEP = 'Schritt wiederholen';

export const TIMELINE_LABEL = 'Zeitleiste: ziehen spult, zwei Finger oder Strg und Mausrad zoomen';
export const LANE_RULER = 'Zählzeiten';
export const LANE_MUSIC = 'Musik';
export const LANE_PARTS = 'Teile';
export const LANE_STEPS = 'Schritte';
export const LANE_VIDEOS = 'Videos';
export const LANE_MOVEMENT = 'Bewegung';

export const INSPECTOR_LABEL = 'Eigenschaften';
export const INSPECTOR_CLOSE = 'Auswahl aufheben';
export const INSPECTOR_TOOLS = 'Werkzeuge';
export const INSPECTOR_LATER = 'kommt noch';
export const INSPECTOR_CHANGED = 'Nur hier geändert, nicht gespeichert';
export const INSPECTOR_IDLE_HINT =
  'Tippe ein Lied, einen Teil, einen Schritt, ein Video, einen Wegpunkt oder einen Platz an.';
export const ACT_EYEBROW = 'Auftritt';

export const ACTION_JUMP = 'Anspringen';
export const ACTION_LOOP = 'Wiederholen';
export const ACTION_RESET = 'Zurücksetzen';
export const ACTION_EARLIER = '−0,1 s';
export const ACTION_LATER = '+0,1 s';
export const ACTION_EARLIER_LABEL = 'Video 0,1 Sekunden früher';
export const ACTION_LATER_LABEL = 'Video 0,1 Sekunden später';

export const FACT_LENGTH = 'Länge';
export const FACT_SONGS = 'Lieder';
export const FACT_STEPS = 'Schritte';
export const FACT_PARTS = 'Teile';
export const FACT_SPOTS = 'Plätze';
export const FACT_VIDEOS = 'Videos';
export const FACT_STAGE = 'Bühne';
export const FACT_IN_MIX = 'In der Musik';
export const FACT_CUT = 'Schnitt in der Datei';
export const FACT_FILE_LENGTH = 'Datei';
export const FACT_TEMPO = 'Tempo';
export const FACT_FIRST_BEAT = 'Erste 1';
export const FACT_FINAL = 'Endfassung';
export const FACT_RANGE = 'Bereich';
export const FACT_PART = 'Teil';
export const FACT_MAIN_VIDEO = 'Hauptvideo';
export const FACT_VIDEO = 'Video';
export const FACT_START = 'Anfang';
export const FACT_END = 'Ende';
export const FACT_STATE = 'Stand';
export const FACT_ROLE = 'Rolle';
export const FACT_SIDE = 'Seite';
export const FACT_DEPTH = 'Tiefe';
export const FACT_FACING = 'Blick';
export const FACT_WAYPOINTS = 'Wegpunkte';
export const FACT_NOW = 'Gerade';
export const FACT_PERSON = 'Person';
export const FACT_EASING = 'Übergang';
export const FACT_BEND = 'Bogen';
export const FACT_COUNT = 'Zählzeit';

export const VALUE_NONE = 'keine';
export const VALUE_NONE_ONE = 'keins';
export const VALUE_FREE = 'frei';
export const VALUE_YES = 'ja';
export const VALUE_NO = 'nein';
export const VALUE_MOVING = 'in Bewegung';
export const VALUE_STILL = 'steht';
export const VALUE_FILMED = 'mit Video';
export const VALUE_UNFILMED = 'ohne Video';
export const VALUE_OUTDATED = 'veraltet';
export const VALUE_CURRENT = 'aktuell';
export const VALUE_MAIN = 'Hauptvideo';
export const VALUE_ALTERNATIVE = 'weitere Aufnahme';
export const VALUE_READY = 'bereit';
export const VALUE_PROCESSING = 'wird verarbeitet';
export const VALUE_FAILED = 'fehlerhaft';
export const VALUE_TO_AUDIENCE = 'zum Publikum';

export const SONG_SLOTS: readonly string[] = [
  'Anfang und Ende am Wellenbild schneiden',
  'Erste 1 und Tempo',
  'Reihenfolge',
  'Endfassung hochladen und angleichen',
];
export const PART_SLOTS: readonly string[] = [
  'Name',
  'Grenzen auf Schrittgrenzen',
  'Hauptvideo wählen',
];
export const STEP_SLOTS: readonly string[] = [
  'Name und Beschreibung',
  'Schritt teilen oder löschen',
  'Aufstellung kopieren',
];
export const VIDEO_SLOTS: readonly string[] = [
  'Automatisch angleichen',
  'Hauptvideo eines Teils',
  'Video hochladen',
];
export const SPOT_SLOTS: readonly string[] = [
  'Person zuordnen',
  'Spiegeln',
  'Ausrichten und verteilen',
  'Vorlagen: Linie, Block, Kreis',
  'Vorige Aufstellung durchscheinen',
];
export const KEYFRAME_SLOTS: readonly string[] = [
  'Von Zählzeit zu Zählzeit ziehen',
  'Kurve biegen',
  'Übergang',
  'Blickrichtung',
];

export const STEP_HINT = 'Die linke Kante ziehen: Anfang auf eine Zählzeit verschieben.';
export const STEP_FIRST_HINT = 'Der erste Schritt beginnt mit der Musik.';
export const VIDEO_HINT = 'Den Block ziehen: das Video auf der Musik verschieben.';
export const SPOT_HINT = 'Punkt ziehen: die Aufstellung an dieser Stelle verschieben.';
export const KEYFRAME_HINT = 'Die Punkte auf der Bühne zeigen die Aufstellung an diesem Wegpunkt.';

export const timecodeOf = (seconds: number): string => {
  const tenths = Math.max(0, Math.floor(seconds * TENTHS));
  const minutes = Math.floor(tenths / (SECONDS_PER_MINUTE * TENTHS));
  const rest = Math.floor(tenths / TENTHS) % SECONDS_PER_MINUTE;

  return `${minutes}:${String(rest).padStart(2, '0')},${tenths % TENTHS}`;
};

export const spanOf = (start: number, end: number): string =>
  `${timecodeOf(start)}–${timecodeOf(end)}`;

export const secondsTextOf = (seconds: number): string =>
  `${(Math.round(seconds * TENTHS) / TENTHS).toFixed(1).replace('.', ',')} s`;

export const countLineOf = (reading: CountReading | null): string =>
  reading === null ? 'ohne Zählzeit' : `Achter ${reading.eight} · ${reading.count}`;

export const clockLabelOf = (time: string, reading: CountReading | null): string =>
  reading === null ? time : `${time}, Achter ${reading.eight}, Zählzeit ${reading.count}`;

export const eightsTextOf = (eights: number | null): string =>
  eights === null ? '' : ` · ${String(eights).replace('.', ',')} × 8`;

export const songLabelOf = (number: number, name: string): string => `Lied ${number}: ${name}`;
export const songEyebrowOf = (number: number, count: number): string =>
  `Lied ${number} von ${count}`;
export const partLabelOf = (name: string): string => `Teil ${name}`;
export const stepLabelOf = (number: number, name: string): string => `Schritt ${number}: ${name}`;
export const stepEyebrowOf = (number: number, part: string | null): string =>
  part === null ? `Schritt ${number}` : `Schritt ${number} · ${part}`;
export const videoLabelOf = (name: string | null): string => `Video ${name ?? 'ohne Namen'}`;
export const videoTitleOf = (name: string | null): string => name ?? 'Video ohne Namen';
export const videoEyebrowOf = (mainOf: string | null): string =>
  mainOf === null ? 'Video' : `Hauptvideo · ${mainOf}`;
export const markLabelOf = (name: string): string => `Anfang von ${name} verschieben`;
export const tickLabelOf = (seconds: number, count: number): string =>
  `Wegpunkt bei ${timecodeOf(seconds)}, ${count} ${count === 1 ? 'Platz' : 'Plätze'}`;
export const rulerTextOf = (eight: number): string => String(eight);

export const spotTitleOf = (number: number): string => `Platz ${number}`;
export const spotsTitleOf = (count: number): string => `${count} Plätze`;
export const spotNumbersOf = (numbers: readonly number[]): string => numbers.join(', ');
export const personNameOf = (firstName: string, lastName: string): string =>
  `${firstName} ${lastName}`;
export const spotDotLabelOf = (number: number, person: string | null): string =>
  person === null ? `Platz ${number}, frei` : `Platz ${number}, ${person}`;

export const sideTextOf = (rightMetres: number): string => {
  const metres = Math.abs(rightMetres).toFixed(1).replace('.', ',');

  if (Math.abs(rightMetres) < 0.05) {
    return 'Mitte';
  }

  return rightMetres > 0 ? `${metres} m rechts` : `${metres} m links`;
};

export const depthTextOf = (backMetres: number): string =>
  `${backMetres.toFixed(1).replace('.', ',')} m hinten`;

export const facingTextOf = (degrees: number | null): string => {
  if (degrees === null) {
    return '–';
  }
  const turned = ((Math.round(degrees) % FULL_TURN) + FULL_TURN) % FULL_TURN;

  return turned === 0 ? VALUE_TO_AUDIENCE : `${turned}°`;
};

export const tempoTextOf = (bpm: number | null): string =>
  bpm === null ? '–' : `${Math.round(bpm)} Schläge/min`;

export const stageTextOf = (width: number, depth: number): string =>
  `${String(width).replace('.', ',')} × ${String(depth).replace('.', ',')} m`;

export const spotsCountTextOf = (total: number, open: number): string =>
  open === 0 ? String(total) : `${total} (${open} frei)`;

export const stepsOfPartTextOf = (count: number, first: number, last: number): string =>
  `${count} (${first}–${last})`;

export const keyframeTitleOf = (reading: CountReading | null, seconds: number): string =>
  reading === null ? timecodeOf(seconds) : `Achter ${reading.eight} · ${reading.count}`;

export const keyframeEyebrowOf = (seconds: number): string => `Wegpunkt · ${timecodeOf(seconds)}`;

const EASING_TEXT: Record<KeyframeEasing, string> = {
  linear: 'gleichmäßig',
  easeIn: 'langsam los',
  easeOut: 'langsam an',
  easeInOut: 'weich',
};

export const easingTextOf = (easing: KeyframeEasing | null): string =>
  easing === null ? '–' : EASING_TEXT[easing];

export const viewerCaptionOf = (step: string, part: string | null): string =>
  part === null ? step : `${step} · ${part}`;
