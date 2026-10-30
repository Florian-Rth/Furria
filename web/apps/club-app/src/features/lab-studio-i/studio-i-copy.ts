import type { StagePoint } from '@/features/act-player/choreography-motion';
import type { BeatPlace } from './studio-i-spans';
import type { ClipCover, ClipRole } from './studio-i-video';

const SECONDS_PER_MINUTE = 60;
const TENTHS = 10;

export const STUDIO_I_FALLBACK_TITLE = 'Auftritt bearbeiten';
export const STUDIO_I_DENIED = 'Diesen Auftritt kannst du nicht öffnen.';
export const STUDIO_I_CLOSED = 'Für diesen Auftritt gibt es noch kein Studio.';
export const STUDIO_I_EDIT = 'Bearbeiten';
export const STUDIO_I_EDIT_LABEL = 'Bearbeiten ab dem Schritt, der gerade läuft';
export const STUDIO_I_DONE = 'Fertig';
export const STUDIO_I_EDITOR_LABEL = 'Auftritt bearbeiten';
export const STUDIO_I_RAIL_LABEL = 'Schritte zum Bearbeiten';
export const STUDIO_I_MUSIC_PAGE = 'Musik und Plätze';
export const STUDIO_I_NAME_LABEL = 'Name des Schritts';
export const STUDIO_I_NOTE_LABEL = 'Beschreibung des Schritts';
export const STUDIO_I_NOTE_EMPTY = 'Beschreibung: was passiert in diesem Schritt?';
export const STUDIO_I_WAVE_LABEL = 'Musik dieses Schritts';
export const STUDIO_I_WHOLE_LABEL = 'Ganze Musik';
export const STUDIO_I_LEGEND_BEFORE = 'Anfang';
export const STUDIO_I_LEGEND_AFTER = 'Ende';
export const STUDIO_I_STAGE_LABEL = 'Aufstellung am Ende des Schritts';
export const STUDIO_I_FRAME_LABEL = 'Bühne und Video';
export const STUDIO_I_COUNTS_LABEL = 'Bewegung auf den Zählzeiten';
export const STUDIO_I_COUNTS_STILL = 'Alle stehen in diesem Schritt';
export const STUDIO_I_VIDEO_TITLE = 'Video';
export const STUDIO_I_VIDEO_NONE = 'Kein Video für diesen Schritt';
export const STUDIO_I_VIDEO_NONE_EYEBROW = 'Video';
export const STUDIO_I_SHOW_VIDEO = 'Video groß zeigen';
export const STUDIO_I_SHOW_STAGE = 'Bühne groß zeigen';
export const STUDIO_I_TRANSPORT = 'Schritt abspielen';
export const STUDIO_I_PREVIOUS = 'Vorheriger Schritt';
export const STUDIO_I_NEXT = 'Nächster Schritt';
export const STUDIO_I_CLOSE = 'Auswahl schließen';
export const STUDIO_I_DETAIL = 'Auswahl';
export const STUDIO_I_RESET = 'Zurücksetzen';
export const STUDIO_I_FREE = 'frei';
export const STUDIO_I_MORE_SLOT = 'Spiegeln, ausrichten, Vorlagen';
export const STUDIO_I_MORE_SOON = 'Aus einem anderen Schritt übernehmen und mehr · kommt noch';
export const STUDIO_I_SONGS = 'Lieder';
export const STUDIO_I_SPOTS = 'Plätze';
export const STUDIO_I_STAGE = 'Unsere Bühne';
export const STUDIO_I_FINAL = 'Endfassung';
export const STUDIO_I_FINAL_NONE = 'keine';
export const STUDIO_I_FINAL_SLOT = 'Datei der Technik';
export const STUDIO_I_FINAL_NOTE = 'Die fertige Datei von der Technik ersetzt später die Lieder.';
export const STUDIO_I_PART = 'Teil';
export const STUDIO_I_NO_PART = 'ohne Teil';
export const STUDIO_I_TIME = 'Zeit';
export const STUDIO_I_LENGTH = 'Länge';
export const STUDIO_I_MOVES = 'Bewegung';
export const STUDIO_I_MOVES_HINT = 'Achter.Zählzeit';
export const STUDIO_I_VIDEO = 'Video';
export const STUDIO_I_PLACE = 'Platz am Ende';
export const STUDIO_I_FROM = 'Kommt von';
export const STUDIO_I_WAY = 'Weg';
export const STUDIO_I_BORDER = 'Grenze';
export const STUDIO_I_COUNT = 'Zählzeit';
export const STUDIO_I_NEIGHBOUR = 'Nachbar';
export const STUDIO_I_ROLE = 'Rolle';
export const STUDIO_I_RUNS = 'Läuft';
export const STUDIO_I_COVERS = 'Deckt ab';
export const STUDIO_I_OFFSET = 'Versatz';
export const STUDIO_I_EARLIER = 'Ein Bild früher';
export const STUDIO_I_LATER = 'Ein Bild später';
export const STUDIO_I_STEP_SUMMARY = 'Dieser Schritt';
export const STUDIO_I_START_MARK = 'Anfang';
export const STUDIO_I_END_MARK = 'Ende';
export const STUDIO_I_STRAIGHT = 'gerade';
export const STUDIO_I_BENT = 'im Bogen';
export const STUDIO_I_STILL = 'bleibt stehen';

const tenthsOf = (seconds: number): number => Math.round(Math.max(0, seconds) * TENTHS);

export const timeText = (seconds: number): string => {
  const tenths = tenthsOf(seconds);
  const whole = Math.floor(tenths / TENTHS);
  const minutes = Math.floor(whole / SECONDS_PER_MINUTE);
  const rest = whole % SECONDS_PER_MINUTE;

  return `${minutes}:${String(rest).padStart(2, '0')},${tenths % TENTHS}`;
};

export const rangeText = (start: number, end: number): string =>
  `${timeText(start)}–${timeText(end)}`;

const decimalText = (value: number, digits: number): string =>
  value.toFixed(digits).replace('.', ',');

export const offsetText = (shift: number): string =>
  `${shift < 0 ? '−' : '+'}${decimalText(Math.abs(shift), 2)} s`;

export const metresText = (point: StagePoint): string => {
  const side = point.rightMetres < 0 ? 'links' : 'rechts';
  const across =
    Math.abs(point.rightMetres) < 1e-3
      ? 'Mitte'
      : `${decimalText(Math.abs(point.rightMetres), 2)} m ${side}`;

  return `${across} · ${decimalText(point.backMetres, 2)} m hinten`;
};

export const countsText = (counts: number): string =>
  `${counts} ${counts === 1 ? 'Zählzeit' : 'Zählzeiten'}`;

export const lengthText = (counts: number, seconds: number): string =>
  `${countsText(counts)} · ${decimalText(seconds, 1)} s`;

const placeText = (place: BeatPlace): string => `${place.eight}.${place.count}`;

export const countRangeText = (from: BeatPlace | null, to: BeatPlace | null): string =>
  from === null || to === null ? '–' : `${placeText(from)}–${placeText(to)}`;

export const placeLabelOf = (place: BeatPlace | null): string =>
  place === null ? '–' : `${place.count} im ${place.eight}. Achter`;

export const pageEyebrowOf = (part: string | null, number: number, total: number): string =>
  `${part ?? STUDIO_I_NO_PART} · ${number}/${total}`;

export const stepNumberLabelOf = (number: number): string => `Schritt ${number}`;

export const tileLabelOf = (number: number, name: string): string =>
  `Schritt ${number}, ${name}, bearbeiten`;

export const markLabelOf = (edge: 'start' | 'end', time: string): string =>
  `${edge === 'start' ? STUDIO_I_START_MARK : STUDIO_I_END_MARK} des Schritts bei ${time}, ziehen zum Verschieben`;

export const markTitleOf = (edge: 'start' | 'end', name: string): string =>
  `${edge === 'start' ? STUDIO_I_START_MARK : STUDIO_I_END_MARK} von ${name}`;

export const neighbourTextOf = (edge: 'start' | 'end', name: string | null): string => {
  if (name === null) {
    return edge === 'start' ? 'Anfang der Musik' : 'Ende der Musik';
  }

  return edge === 'start' ? `${name} endet hier` : `${name} beginnt hier`;
};

export const edgeTextOf = (side: 'start' | 'end', name: string | null): string =>
  name === null ? '' : side === 'start' ? `‹ ${name}` : `${name} ›`;

export const spotTitleOf = (number: number): string => `Platz ${number}`;

export const dotLabelOf = (number: number, person: string | null): string =>
  `Platz ${number}${person === null ? ', frei' : `, ${person}`}: antippen zum Auswählen, ziehen zum Verschieben`;

export const laneTextOf = (number: number | null, moving: number, range: string): string =>
  number === null
    ? `${moving} ${moving === 1 ? 'Platz' : 'Plätze'} · ${range}`
    : `${spotTitleOf(number)} · ${range}`;

export const movesTextOf = (moving: number, total: number, range: string): string =>
  moving === 0 ? 'alle stehen' : `${moving} von ${total} Plätzen · ${range}`;

export const clipRoleTextOf = (role: ClipRole, part: string | null): string =>
  role === 'main' ? `Hauptvideo${part === null ? '' : ` · ${part}`}` : 'Alternative';

export const clipCoverTextOf = (cover: ClipCover): string =>
  cover === 'whole' ? 'den ganzen Schritt' : 'einen Teil des Schritts';

export const clipBadgeOf = (role: ClipRole, count: number): string =>
  `${role === 'main' ? 'Hauptvideo' : 'Alternative'}${count > 1 ? ` · 1/${count}` : ''}`;

export const clipBadgeLabelOf = (name: string): string => `${name}: Versatz und Rolle zeigen`;

export const statusTextOf = (playing: boolean, number: number): string =>
  playing
    ? `Schritt ${number} in Schleife · mit Vorlauf`
    : `Schritt ${number} in Schleife · 2 Zählzeiten Vorlauf`;

export const MUSIC_STATUS = 'Abspielen spielt die ganze Musik';

export const musicEyebrowOf = (length: number, songs: number): string =>
  `Ganzer Auftritt · ${timeText(length)} · ${songs} ${songs === 1 ? 'Lied' : 'Lieder'}`;

export const musicTileMetaOf = (songs: number, spots: number): string =>
  `${songs} ${songs === 1 ? 'Lied' : 'Lieder'} · ${spots} Plätze`;

export const songMetaOf = (tempo: number | null, firstBeat: number | null): string => {
  const pace = tempo === null ? 'ohne Takt' : `${Math.round(tempo)} BPM`;
  const first = firstBeat === null ? 'erste 1 fehlt' : `erste 1 bei ${decimalText(firstBeat, 2)} s`;

  return `${pace} · ${first}`;
};

export const songCutOf = (start: number, end: number, duration: number | null): string =>
  duration === null ? rangeText(start, end) : `${rangeText(start, end)} von ${timeText(duration)}`;

export const spotsMetaOf = (taken: number, total: number): string =>
  `${taken} von ${total} besetzt`;

export const stageMetaOf = (width: number, depth: number): string =>
  `${decimalText(width, 1)} × ${decimalText(depth, 1)} m`;

export const songsMetaOf = (length: number): string => `zusammen ${timeText(length)}`;

export const groupMetaOf = (count: number): string =>
  `${count} ${count === 1 ? 'Schritt' : 'Schritte'}`;
