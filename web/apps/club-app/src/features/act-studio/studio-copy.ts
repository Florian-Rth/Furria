import { clockOf } from '@/features/act-practice/practice-step-list';
import type { StudioVideo } from '@/features/acts/schemas';
import type { MediaItemState } from '@/lib/api/schemas';
import type { UploadFailure } from '@/lib/media/upload-failure';
import type { OutsideMusic } from './studio-music';
import type { CountSpanView } from './studio-timing';

type VideoPlacement = StudioVideo['placement'];

export type StudioTool = 'music' | 'steps' | 'formation' | 'movement' | 'video';

export const STUDIO_LABEL = 'Üben und bearbeiten';
export const STUDIO_EDIT = 'Bearbeiten';
export const STUDIO_DONE = 'Fertig';
export const STUDIO_TOOLS_LABEL = 'Werkzeug wählen';

export const STUDIO_TOOLS: readonly { tool: StudioTool; label: string }[] = [
  { tool: 'music', label: 'Musik' },
  { tool: 'steps', label: 'Schritte' },
  { tool: 'formation', label: 'Aufstellung' },
  { tool: 'movement', label: 'Bewegung' },
  { tool: 'video', label: 'Video' },
];

export const STUDIO_WAVE_LABEL = 'Musik: tippen oder ziehen zum Spulen';
export const STUDIO_SONGS = 'Lieder';
export const STUDIO_FINAL = 'Endfassung';
export const STUDIO_FINAL_NONE = 'Noch keine Endfassung';
export const STUDIO_SONG_ADD = 'Lieder hinzufügen';
export const STUDIO_OUTSIDE_MUSIC = 'Außerhalb der Musik';
export const STUDIO_SONG_ACCEPT =
  'audio/mpeg,audio/wav,audio/x-wav,audio/aiff,audio/x-aiff,audio/flac,audio/mp4,audio/x-m4a,.mp3,.wav,.aif,.aiff,.flac,.m4a';
export const STUDIO_SONG_DESK = 'Lied bearbeiten';
export const STUDIO_SONG_DESK_CLOSE = 'Lied schließen';
export const STUDIO_SONG_TEMPO = 'Tempo';
export const STUDIO_SONG_ONE = 'Die Eins';
export const STUDIO_SONG_ONE_HERE = 'Eins auf die Abspielstelle';
export const STUDIO_SONG_ONE_EARLIER = 'Eins früher';
export const STUDIO_SONG_ONE_LATER = 'Eins später';
export const STUDIO_NUDGE_BACK = '‹';
export const STUDIO_NUDGE_ON = '›';
export const STUDIO_SONG_ORDER = 'Reihenfolge';
export const STUDIO_SONG_EARLIER = 'Nach vorn';
export const STUDIO_SONG_LATER = 'Nach hinten';
export const STUDIO_SONG_REMOVE = 'Lied entfernen';
export const STUDIO_SONG_REMOVE_SURE = 'Wirklich entfernen';
export const STUDIO_SONG_PREPARING = 'wird vorbereitet';
export const STUDIO_SONG_FAILED = 'ließ sich nicht vorbereiten';

export const STUDIO_MARKS_LABEL = 'Schritte und Teile';
export const STUDIO_NAME_LABEL = 'Name des Schritts';
export const STUDIO_NAME_PLACEHOLDER = 'Name';
export const STUDIO_NOTE_LABEL = 'Beschreibung des Schritts';
export const STUDIO_NOTE_PLACEHOLDER = 'Beschreibung hinzufügen';

export const STUDIO_RAIL_TITLE = 'Schritte';
export const STUDIO_RAIL_LABEL = 'Alle Schritte nach Teilen';
export const STUDIO_MARK_HERE = 'Neuer Schritt hier';
export const STUDIO_STEP_DESK = 'Schritt bearbeiten';
export const STUDIO_STEP_DESK_CLOSE = 'Schritt schließen';
export const STUDIO_STEP = 'Schritt';
export const STUDIO_STEP_REMOVE = 'Schritt entfernen';
export const STUDIO_STEP_REMOVE_SURE = 'Wirklich entfernen';
export const STUDIO_PART = 'Teil';
export const STUDIO_PART_NAME = 'Name des Teils';
export const STUDIO_PART_OPEN = 'Neuer Teil ab hier';
export const STUDIO_PART_EARLIER = 'Beginnt früher';
export const STUDIO_PART_LATER = 'Beginnt später';
export const STUDIO_PART_REMOVE = 'Teil auflösen';
export const STUDIO_PART_REMOVE_SURE = 'Wirklich auflösen';
export const STUDIO_MAIN_VIDEO = 'Hauptvideo';
export const STUDIO_MAIN_VIDEO_NONE = 'Keins';
export const STUDIO_STEP_NAME_LENGTH = 80;
export const STUDIO_STEP_NOTE_LENGTH = 2000;
export const STUDIO_PART_NAME_LENGTH = 80;

export const STUDIO_STAGE_LABEL = 'Bühne: Punkte antippen und ziehen';
export const STUDIO_FRONT = 'Publikum';
export const STUDIO_TOOLBAR_LABEL = 'Bühne bearbeiten';
export const STUDIO_MULTI = 'Mehrere';
export const STUDIO_MIRROR = 'Spiegeln';
export const STUDIO_ONION = 'Vorher';
export const STUDIO_NOTHING_SELECTED = 'Punkt antippen';
export const STUDIO_SELECTION_OPEN = 'Auswahl zeigen';
export const STUDIO_SPOTS = 'Plätze';
export const STUDIO_SPOTS_CLOSE = 'Auswahl schließen';
export const STUDIO_OPEN_SPOT = 'offen';
export const STUDIO_LATER_TITLE = 'Ausrichten · Verteilen · Vorlagen · Von Schritt kopieren';
export const STUDIO_LATER = 'kommt noch';
export const STUDIO_SELECTED = 'gewählt';

export const STUDIO_COUNTS_LABEL = 'Zählzeiten des Schritts: von Zählzeit zu Zählzeit ziehen';
export const STUDIO_NO_MOVE = 'Kein Weg in diesem Schritt';
export const STUDIO_PICK_DOTS = 'Punkte auf der Bühne wählen';

export const STUDIO_PLACEMENT_LABEL = 'Wo das Video auf der Musik liegt';
export const STUDIO_EARLIER = 'Video früher';
export const STUDIO_LATER_NUDGE = 'Video später';
export const STUDIO_TAKES = 'Videos je Teil';
export const STUDIO_MAIN = 'Haupt';
export const STUDIO_ALTERNATIVE = 'Alternative';
export const STUDIO_OUTDATED = 'veraltet';
export const STUDIO_NO_VIDEO = 'kein Video';
export const STUDIO_NO_VIDEO_HERE = 'Hier liegt kein Video';
export const STUDIO_VIDEOS_UNPLACED = 'Noch nicht auf der Musik';
export const STUDIO_VIDEO_ADD = 'Videos hinzufügen';
export const STUDIO_VIDEO_ACCEPT = 'video/*';
export const STUDIO_VIDEO_DESK = 'Video bearbeiten';
export const STUDIO_VIDEO_DESK_CLOSE = 'Video schließen';
export const STUDIO_VIDEO_NAME = 'Name';
export const STUDIO_VIDEO_NAME_LENGTH = 80;
export const STUDIO_VIDEO_NAME_HINT = 'z. B. Seite oder Probe 21.10.';
export const STUDIO_VIDEO_PLACE = 'Auf der Musik';
export const STUDIO_VIDEO_ALIGN = 'Automatisch anlegen';
export const STUDIO_VIDEO_ALIGNING = 'Wird angelegt …';
export const STUDIO_VIDEO_START_HERE = 'Beginnt hier';
export const STUDIO_VIDEO_MAIN_FOR = 'Hauptvideo für';
export const STUDIO_VIDEO_REMOVE = 'Video entfernen';
export const STUDIO_VIDEO_REMOVE_SURE = 'Wirklich entfernen?';

const SHELF_META: Record<'processing' | 'failed' | VideoPlacement, string> = {
  processing: 'wird vorbereitet',
  failed: 'ließ sich nicht vorbereiten',
  unaligned: 'noch nicht angelegt',
  cutAway: 'Musik dazu weggeschnitten',
  musicMissing: 'Lied dazu entfernt',
  onTimeline: 'auf der Musik',
};

export const shelfMetaOf = (state: MediaItemState, placement: VideoPlacement): string =>
  state === 'ready' ? SHELF_META[placement] : SHELF_META[state];

export const fineClockOf = (seconds: number): string => {
  const sign = seconds < 0 ? '-' : '';
  const tenths = Math.round(Math.abs(seconds) * 10);
  const minutes = Math.floor(tenths / 600);
  const rest = (tenths % 600) / 10;
  const [whole = '0', fraction = '0'] = rest.toFixed(1).split('.');

  return `${sign}${minutes}:${whole.padStart(2, '0')},${fraction}`;
};

export const offsetTextOf = (seconds: number): string => {
  const sign = seconds > 0 ? '+' : seconds < 0 ? '−' : '±';

  return `${sign}${Math.abs(seconds).toFixed(2).replace('.', ',')} s`;
};

export const songMetaOf = (start: number, end: number, bpm: number | null): string =>
  bpm === null
    ? `${clockOf(start)}–${clockOf(end)}`
    : `${clockOf(start)}–${clockOf(end)} · ${Math.round(bpm)} BPM`;

export const songCardMetaOf = (
  start: number,
  end: number,
  duration: number | null,
  bpm: number | null,
): string => {
  const cut = `Schnitt ${clockOf(start)}–${clockOf(end)}`;
  const whole = duration === null ? '' : ` von ${clockOf(duration)}`;
  const tempo = bpm === null ? ' · Takt fehlt' : ` · ${Math.round(bpm)} BPM`;

  return `${cut}${whole}${tempo}`;
};

export const songNameOf = (fileName: string): string => fileName.replace(/\.[a-z0-9]+$/i, '');

export const songRowLabelOf = (name: string): string => `${name}: an den Anfang springen`;

export const cutHandleLabelOf = (edge: 'start' | 'end', name: string): string =>
  edge === 'start' ? `Anfang von ${name} schneiden` : `Ende von ${name} schneiden`;

export const markLabelOf = (number: number, name: string): string =>
  `Schritt ${number} ${name}: dorthin springen`;

export const borderLabelOf = (name: string): string => `Grenze nach ${name} verschieben`;

export const spotTitleOf = (number: number, name: string | null): string =>
  name === null ? `Platz ${number}` : `Platz ${number} · ${name}`;

export const selectionTextOf = (count: number, single: string | null): string => {
  if (count === 0) {
    return STUDIO_NOTHING_SELECTED;
  }

  return count === 1 && single !== null ? single : `${count} Plätze`;
};

export const spotMetaOf = (rightMetres: number, backMetres: number, keys: number): string => {
  const side =
    Math.abs(rightMetres) < 0.05
      ? 'Mitte'
      : `${Math.abs(rightMetres).toFixed(1).replace('.', ',')} m ${rightMetres > 0 ? 'rechts' : 'links'}`;

  return `${side} · ${backMetres.toFixed(1).replace('.', ',')} m hinten · ${keys} Wegpunkte`;
};

export const formationTextOf = (number: number, start: number): string =>
  `Aufstellung Schritt ${number} · ab ${fineClockOf(start)}`;

export const countSpanTextOf = (view: CountSpanView | null, eights: number): string => {
  if (view === null) {
    return STUDIO_NO_MOVE;
  }

  const takt = `Takt ${view.fromCount} – ${view.toCount}`;

  if (eights < 2) {
    return takt;
  }

  return view.fromEight === view.toEight
    ? `${takt} · ${view.fromEight + 1}. Achter`
    : `${takt} · Achter ${view.fromEight + 1}–${view.toEight + 1}`;
};

export const movedDotsTextOf = (count: number): string =>
  count === 1 ? '1 Platz' : `${count} Plätze`;

export const placementTextOf = (name: string, start: number, shift: number | null): string =>
  shift === null
    ? `${name} · ab ${fineClockOf(start)}`
    : `${name} · ab ${fineClockOf(start)} · Versatz ${offsetTextOf(shift)}`;

export const videoBarLabelOf = (name: string): string => `${name}: wählen und verschieben`;

export const takeMetaOf = (start: number | null, duration: number | null): string =>
  start === null || duration === null
    ? 'noch nicht angelegt'
    : `${fineClockOf(start)}–${fineClockOf(start + duration)}`;

export const dotLabelOf = (number: number, name: string | null): string =>
  `${spotTitleOf(number, name)}: wählen und ziehen`;

const TEMPO_FRACTION_DIGITS = 1;
const BEAT_FRACTION_DIGITS = 2;

const decimalOf = (value: number, digits: number): string =>
  value.toFixed(digits).replace('.', ',');

export const tempoTextOf = (tempo: number | null): string =>
  tempo === null ? '–' : `${decimalOf(tempo, TEMPO_FRACTION_DIGITS)} BPM`;

const nudgeAmountOf = (delta: number): string =>
  decimalOf(Math.abs(delta), Math.abs(delta) < 1 ? TEMPO_FRACTION_DIGITS : 0);

export const tempoNudgeTextOf = (delta: number): string =>
  `${delta > 0 ? '+' : '−'}${nudgeAmountOf(delta)}`;

export const tempoNudgeLabelOf = (delta: number): string =>
  `Tempo ${delta > 0 ? 'um' : 'um minus'} ${nudgeAmountOf(delta)} BPM ändern`;

export const firstBeatTextOf = (seconds: number | null): string =>
  seconds === null ? '–' : `bei ${decimalOf(seconds, BEAT_FRACTION_DIGITS)} s`;

export const songStateMetaOf = (state: MediaItemState): string | null => {
  switch (state) {
    case 'processing':
      return STUDIO_SONG_PREPARING;
    case 'failed':
      return STUDIO_SONG_FAILED;
    case 'ready':
      return null;
  }
};

export const songEditLabelOf = (name: string): string => `${name} bearbeiten`;

export type UploadKind = 'song' | 'video';

const UPLOAD_FAILURES: Record<Exclude<UploadFailure, 'notAccepted'>, string> = {
  tooLarge: 'zu groß',
  notAllowed: 'nicht erlaubt',
  gone: 'Auftritt gibt es nicht mehr',
  interrupted: 'abgebrochen',
};

const NOT_ACCEPTED: Record<UploadKind, string> = {
  song: 'keine Musikdatei',
  video: 'keine Videodatei',
};

const failureTextOf = (failure: UploadFailure, kind: UploadKind): string =>
  failure === 'notAccepted' ? NOT_ACCEPTED[kind] : UPLOAD_FAILURES[failure];

export const uploadMetaOf = (
  share: number,
  failure: UploadFailure | null,
  kind: UploadKind,
): string => (failure === null ? `${Math.round(share * 100)} %` : failureTextOf(failure, kind));

export const uploadLabelOf = (
  name: string,
  failure: UploadFailure | null,
  kind: UploadKind,
): string =>
  failure === null
    ? `${name} wird hochgeladen`
    : `${name}: ${failureTextOf(failure, kind)}, antippen zum Ausblenden`;

const countOf = (count: number, one: string, many: string): string | null => {
  if (count === 0) {
    return null;
  }

  return count === 1 ? `1 ${one}` : `${count} ${many}`;
};

export const outsideMusicTextOf = ({ steps, videos, keyframes }: OutsideMusic): string | null => {
  const parts = [
    countOf(steps, 'Schritt', 'Schritte'),
    countOf(videos, 'Video', 'Videos'),
    countOf(keyframes, 'Wegpunkt', 'Wegpunkte'),
  ].filter((part) => part !== null);

  return parts.length === 0 ? null : parts.join(' · ');
};

export const newPartNameOf = (number: number): string => `Teil ${number}`;

export const stepDeskTitleOf = (number: number, name: string): string =>
  name.trim() === '' ? `Schritt ${number}` : `${number} · ${name}`;

export const videoNameOf = (name: string | null, number: number): string =>
  name ?? `Video ${number}`;
