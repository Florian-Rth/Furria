import type { MediaItemState } from '@furria/api-client/media-schemas';
import type { UploadFailure } from '@furria/api-client/upload-failure';
import { formatReadoutMetres } from '@furria/studio/drag-readout';
import type { GesturePrecisionTier } from '@furria/studio/gesture-recogniser';
import type { CountAt, TimelineRange } from '@furria/studio/music-timeline';
import { clockOf } from '@furria/studio/practice-step-list';
import type { CutEdge } from '@furria/studio/studio-cuts';
import type { OutsideMusic } from '@furria/studio/studio-music';
import type { SongPiece, StudioVideo } from '@furria/studio/studio-schemas';

type VideoPlacement = StudioVideo['placement'];

export type StudioTool = 'music' | 'steps' | 'formation' | 'movement' | 'video';

export const STUDIO_LABEL = 'Üben und bearbeiten';

export const STUDIO_TOOLS: readonly { tool: StudioTool; label: string }[] = [
  { tool: 'music', label: 'Musik' },
  { tool: 'steps', label: 'Schritte' },
  { tool: 'formation', label: 'Aufstellung' },
  { tool: 'movement', label: 'Bewegung' },
  { tool: 'video', label: 'Video' },
];

export const STUDIO_WAVE_LABEL =
  'Musik: wischen zum Spulen, tippen springt hin, mit zwei Fingern zoomen';
export const STUDIO_SONGS = 'Lieder';
export const STUDIO_FINAL = 'Endfassung';
export const STUDIO_FINAL_NONE = 'Noch keine Endfassung';
export const STUDIO_FINAL_UPLOAD = 'Endfassung hochladen';
export const STUDIO_FINAL_UPLOAD_NEWER = 'Neue Endfassung hochladen';
export const STUDIO_FINAL_LEAD = 'E';
export const STUDIO_FINAL_TRYING = 'Probehören';
export const STUDIO_FINAL_DESK = 'Lied in der Endfassung';
export const STUDIO_FINAL_DESK_CLOSE = 'Schließen';
export const STUDIO_FINAL_GRID_DESK = 'Endfassung bearbeiten';
export const STUDIO_FINAL_PLACE = 'Lage';
export const STUDIO_FINAL_START_HERE = 'Beginnt hier';
export const STUDIO_FINAL_FILE = 'Endfassung';
export const STUDIO_FINAL_MATCH = 'Automatisch abgleichen';
export const STUDIO_FINAL_MATCHING = 'Wird abgeglichen …';
export const STUDIO_FINAL_REMOVE = 'Endfassung entfernen';
export const STUDIO_FINAL_REMOVE_SURE = 'Wirklich entfernen';
export const STUDIO_SONG_ADD = 'Lieder hinzufügen';
export const STUDIO_OUTSIDE_MUSIC = 'Außerhalb der Musik';
export const STUDIO_SONG_ACCEPT =
  'audio/mpeg,audio/wav,audio/x-wav,audio/aiff,audio/x-aiff,audio/flac,audio/mp4,audio/x-m4a,.mp3,.wav,.aif,.aiff,.flac,.m4a';
export const STUDIO_SONG_DESK = 'Lied bearbeiten';
export const STUDIO_SONG_DESK_CLOSE = 'Lied schließen';
export const STUDIO_SONG_TEMPO = 'Tempo';
export const STUDIO_SONG_ONE = 'Zählbeginn';
export const STUDIO_SONG_ONE_HERE = 'Zählbeginn auf die Abspielstelle';
export const STUDIO_SONG_ONE_EARLIER = 'Zählbeginn früher';
export const STUDIO_SONG_ONE_LATER = 'Zählbeginn später';
export const STUDIO_NUDGE_BACK = '‹';
export const STUDIO_NUDGE_ON = '›';
export const STUDIO_SONG = 'Lied';
export const songMoveLabelOf = (name: string): string => `${name} verschieben`;
export const STUDIO_SONG_REMOVE = 'Lied entfernen';
export const STUDIO_SONG_REMOVE_SURE = 'Wirklich entfernen';
export const STUDIO_SONG_PREPARING = 'wird vorbereitet';
export const STUDIO_SONG_FAILED = 'ließ sich nicht vorbereiten';

export const STUDIO_MAIN_VIDEO_NONE = 'Keins';
export const STUDIO_FRONT = 'Publikum';
export const stagePlaceTextOf = (rightMetres: number, backMetres: number): string =>
  `${formatReadoutMetres(rightMetres)} ${rightMetres < 0 ? 'links' : 'rechts'} · ${formatReadoutMetres(backMetres)} hinten`;
export const STUDIO_BEND_LABEL = 'Kurve: ziehen zum Biegen';
const FACING_TEXT: Readonly<Record<number, string>> = {
  0: 'nach vorn',
  45: 'vorn rechts',
  90: 'rechts',
  135: 'hinten rechts',
  180: 'nach hinten',
  225: 'hinten links',
  270: 'links',
  315: 'vorn links',
};

export const facingTextOf = (degrees: number | null): string =>
  degrees === null ? 'frei' : (FACING_TEXT[degrees] ?? `${Math.round(degrees)}°`);

export const STUDIO_TAKES = 'Videos je Teil';
export const STUDIO_TAKES_WITHOUT_PART = 'Ohne Teil';
export const STUDIO_MAIN = 'Haupt';
export const STUDIO_ALTERNATIVE = 'Alternative';
export const STUDIO_OUTDATED = 'veraltet';
export const STUDIO_TAKES_ON_MUSIC = 'Auf der Musik';

export const takeGroupNameOf = (partName: string | null, hasParts: boolean): string => {
  if (partName !== null) {
    return partName;
  }
  return hasParts ? STUDIO_TAKES_WITHOUT_PART : STUDIO_TAKES_ON_MUSIC;
};

export const takeBadgeOf = (outdated: boolean, main: boolean | null): string | null => {
  if (outdated) {
    return STUDIO_OUTDATED;
  }
  if (main === null) {
    return null;
  }
  return main ? STUDIO_MAIN : STUDIO_ALTERNATIVE;
};
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
export const STUDIO_FILM = 'Gewähltes Video';
export const STUDIO_FILM_EMPTY = 'Noch kein Video.';
export const STUDIO_FILM_UNPLACED = 'Noch nicht auf der Musik angelegt';
export const STUDIO_FILM_EARLIER = 'Video früher';
export const STUDIO_FILM_LATER = 'Video später';
export const STUDIO_FILM_EDIT = 'Bearbeiten';
export const STUDIO_FILM_LANES = 'Spuren: Zeit, Teile, Musik, Videos';
export const STUDIO_FILM_NONE = 'noch keins angelegt';

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
  pieces: readonly SongPiece[],
  duration: number | null,
  bpm: number | null,
): string => {
  const [first] = pieces;
  const kept = pieces.reduce((sum, piece) => sum + piece.endSeconds - piece.startSeconds, 0);
  const cut =
    pieces.length === 1 && first !== undefined
      ? `Schnitt ${clockOf(first.startSeconds)}–${clockOf(first.endSeconds)}`
      : `${pieces.length} Stücke · ${clockOf(kept)}`;
  const whole = duration === null ? '' : ` von ${clockOf(duration)}`;
  const tempo = bpm === null ? ' · Takt fehlt' : ` · ${Math.round(bpm)} BPM`;

  return `${cut}${whole}${tempo}`;
};

export const songNameOf = (fileName: string): string => fileName.replace(/\.[a-z0-9]+$/i, '');

export const songRowLabelOf = (name: string): string => `${name}: an den Anfang springen`;

const PRECISION_NAMES: Record<GesturePrecisionTier, string | null> = {
  full: null,
  half: 'halb',
  quarter: 'viertel',
  fine: 'fein',
};

export const waveReadoutDetailOf = (
  count: CountAt | null,
  tier: GesturePrecisionTier,
): string | null => {
  const counted = count === null ? null : `${count.eight + 1}. Acht · ${count.count}`;
  const precision = PRECISION_NAMES[tier];

  return [counted, precision].filter((part) => part !== null).join(' · ') || null;
};

export const STUDIO_CUT = 'Schnitt';
export const STUDIO_CUT_START = 'Anfang';
export const STUDIO_CUT_END = 'Ende';
export const STUDIO_CUT_START_HERE = 'Anfang hier';
export const STUDIO_CUT_SPLIT = 'Teilen';
export const STUDIO_CUT_END_HERE = 'Ende hier';
export const STUDIO_PIECE_REMOVE = 'Stück entfernen';
export const STUDIO_PIECE_REMOVE_SURE = 'Wirklich entfernen';

const CENTS_PER_SECOND = 100;

export const cutClockOf = (seconds: number): string => {
  const cents = Math.round(Math.max(0, seconds) * CENTS_PER_SECOND);
  const minutes = Math.floor(cents / (CENTS_PER_SECOND * 60));
  const rest = cents % (CENTS_PER_SECOND * 60);
  const whole = String(Math.floor(rest / CENTS_PER_SECOND)).padStart(2, '0');
  const fraction = String(rest % CENTS_PER_SECOND).padStart(2, '0');

  return `${minutes}:${whole},${fraction}`;
};

const cutAmountOf = (delta: number): string => String(Math.abs(delta)).replace('.', ',');

export const cutNudgeTextOf = (delta: number): string =>
  `${delta > 0 ? '+' : '−'}${cutAmountOf(delta)}`;

export const cutNudgeLabelOf = (edge: CutEdge, delta: number): string =>
  `${edge === 'start' ? STUDIO_CUT_START : STUDIO_CUT_END} ${cutAmountOf(delta)} s ${delta > 0 ? 'später' : 'früher'}`;

export const borderLabelOf = (name: string): string => `Grenze nach ${name} verschieben`;

export const spotTitleOf = (number: number, name: string | null): string =>
  name === null ? `Platz ${number}` : `Platz ${number} · ${name}`;

export const takeMetaOf = (span: TimelineRange | null): string =>
  span === null ? 'noch nicht angelegt' : `${fineClockOf(span.start)}–${fineClockOf(span.end)}`;

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
  ended: 'nicht mehr angenommen',
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

export const songDeskTitleOf = (
  number: number,
  name: string,
  piece: number,
  pieces: number,
): string =>
  pieces > 1
    ? `Lied ${number} · ${name} · Stück ${piece} von ${pieces}`
    : `Lied ${number} · ${name}`;

export const STUDIO_SONG_GONE = 'Das Lied gibt es nicht mehr. Sein Fenster ist zu.';
export const STUDIO_VIDEO_GONE = 'Das Video gibt es nicht mehr. Sein Fenster ist zu.';
export const EVENING_BAND_PREFIX = 'Du bearbeitest';
export const EVENING_BAND_SUFFIX = 'nicht die Session';

const BAND_DAY = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit' });

export const eveningBandOf = (title: string, startsAt: string): string =>
  `${EVENING_BAND_PREFIX} ${title} ${BAND_DAY.format(new Date(startsAt))} — ${EVENING_BAND_SUFFIX}`;

export const studioBandOf = (
  evening: { title: string; startsAt: string } | null,
  editing: boolean,
): string | null =>
  evening !== null && editing ? eveningBandOf(evening.title, evening.startsAt) : null;

export const videoNameOf = (name: string | null, number: number): string =>
  name ?? `Video ${number}`;

export const finalTitleOf = (version: number): string => `Endfassung ${version}`;

export const finalTrackMetaOf = (
  state: MediaItemState,
  found: number,
  total: number,
  trying: boolean,
): string => {
  const preparing = songStateMetaOf(state);

  if (preparing !== null) {
    return preparing;
  }

  const matched = found === 0 ? 'noch nicht abgeglichen' : `${found} von ${total} gefunden`;

  return trying ? `${matched} · so klingt es übernommen` : `${matched} · antippen zum Probehören`;
};

export const finalTrackLabelOf = (trying: boolean): string =>
  trying ? 'Probehören beenden' : 'Mit der Endfassung probehören';

export const adoptedMetaOf = (bpm: number | null): string =>
  bpm === null ? 'spielt · Takt fehlt' : `spielt · ${Math.round(bpm)} BPM`;

export const finalSourceMetaOf = (start: number | null, end: number | null): string =>
  start === null || end === null
    ? 'in der Endfassung nicht gefunden'
    : `in der Endfassung ${fineClockOf(start)}–${fineClockOf(end)}`;

export const finalShiftLabelOf = (name: string): string => `${name} in der Endfassung verschieben`;

export const adoptTextOf = (sure: boolean, matched: boolean, missing: string | null): string => {
  if (!matched) {
    return 'Endfassung übernehmen · erst ein Lied anlegen';
  }
  if (!sure) {
    return 'Endfassung übernehmen';
  }

  return missing === null ? 'Wirklich übernehmen' : `Wirklich übernehmen · ohne Musik: ${missing}`;
};

export const finalShiftNudgeLabelOf = (delta: number): string =>
  `Lied in der Endfassung um ${Math.abs(delta).toFixed(2).replace('.', ',')} s ${delta < 0 ? 'früher' : 'später'}`;

export const finalDeskLabelOf = (kind: 'source' | 'grid' | null): string =>
  kind === 'grid' ? STUDIO_FINAL_GRID_DESK : STUDIO_FINAL_DESK;

export const STUDIO_CHANGED_ELSEWHERE =
  'Das wurde inzwischen woanders geändert. Deine Änderung ist nicht gespeichert.';
export const STUDIO_RELOAD = 'Neu laden';
