import type { TimelineRange } from '@/features/act-player/music-timeline';
import type { ScoreDoorKey } from './score-doors';
import type { ReadinessItem, ReadinessKey } from './score-readiness';
import type { ScoreCounts, ScoreStepFlag } from './score-steps';

const SECONDS_PER_MINUTE = 60;
const PAD = 2;
const TIME_ZONE = 'Europe/Berlin';

const WEEKDAY_DATE = new Intl.DateTimeFormat('de-DE', {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
  timeZone: TIME_ZONE,
});
const CLOCK = new Intl.DateTimeFormat('de-DE', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: TIME_ZONE,
});

export const SCREEN_TITLE = 'Auftritt';
export const SCORE_LABEL = 'Musik mit Teilen und Schritten';
export const MANUAL_LABEL = 'Schritte nach Teilen';
export const READINESS_LABEL = 'Stand';
export const FACTS_LABEL = 'Das Nächste';
export const FOR_YOU_TITLE = 'Für dich';
export const NEXT_TITLE = 'Als Nächstes';
export const EVENINGS_TITLE = 'Abende';
export const PLACE_LABEL = 'Platz';
export const PRACTISE_LABEL = 'Üben';
export const PLAY_LABEL = 'Abspielen';
export const PAUSE_LABEL = 'Anhalten';
export const LENS_LABEL = 'Ausschnitt';
export const WHOLE_LABEL = 'Ganz';
export const CLOSE_LABEL = 'Schließen';
export const EDIT_LABEL = 'Bearbeiten';
export const EDIT_DRAWER_LABEL = 'Bearbeiten';
export const PRACTISE_FROM_HERE = 'Üben ab hier';
export const EDIT_FROM_HERE = 'Bearbeiten ab hier';
export const FORMATION_TITLE = 'Aufstellung';
export const VIDEO_TITLE = 'Trainervideo';
export const DESCRIPTION_TITLE = 'Beschreibung';
export const NO_DESCRIPTION = 'keine';
export const NO_VIDEO = 'keins an dieser Stelle';
export const NO_FORMATION = 'noch keine';
export const AUDIENCE_LABEL = 'Publikum';
export const TRAINING_FACT = 'Training';
export const EVENING_FACT = 'Abend';
export const MUSIC_FACT = 'Musik';
export const NONE = 'keine';
export const OPEN_SPOT = 'offen';
export const ANSWER_YES = 'Bin da';
export const ANSWER_NO = 'Kann nicht';
export const ANSWER_LABEL = 'Deine Antwort zum Training';
export const TRAININGS_HINT = 'Alle Trainings und Anwesenheit';
export const LOOSE_STEPS = 'Ohne Teil';
export const NO_STEPS = 'Noch keine Schritte';
export const NO_MUSIC = 'Noch keine Musik';
export const MOVEMENT_KEY = 'Bewegung';
export const VIDEO_KEY = 'Video';
export const NUMBER_LABEL = 'Nr.';
export const OPEN_NUMBER = 'offen';
export const EDIT_DOORS_TITLE = 'Alles bearbeiten';
export const READINESS_TITLE = 'Stand';
export const STUDIO_DOOR = 'Im Studio bearbeiten';
export const MUSIC_DOOR = 'Musik & Video';
export const EVENINGS_DOOR = 'Abende';
export const TRAININGS_DOOR = 'Trainings & Anwesenheit';
export const HALL_DOOR = 'Training starten';
export const CO_EDITORS_DOOR = 'Bearbeiten mit';
export const HISTORY_DOOR = 'Verlauf';
export const SETTINGS_DOOR = 'Einstellungen';
export const STUDIO_DOOR_META = 'Schritte, Plätze, Bewegung';
export const MUSIC_DOOR_META = 'Lieder, Endfassung, Videos';
export const EVENINGS_DOOR_META = 'Dabei sein, Besetzung je Abend';
export const SETTINGS_DOOR_META = 'Name, Besetzung, Wünsche, Archiv';
export const STEP_PANE_LABEL = 'Schritt';
export const NO_STUDIO = 'Die Einzelheiten sehen nur die Besetzung und die Gruppenleitung.';

export const DOOR_COPY: Record<ScoreDoorKey, { label: string; meta?: string }> = {
  studio: { label: STUDIO_DOOR, meta: STUDIO_DOOR_META },
  music: { label: MUSIC_DOOR, meta: MUSIC_DOOR_META },
  evenings: { label: EVENINGS_DOOR, meta: EVENINGS_DOOR_META },
  trainings: { label: TRAININGS_DOOR },
  hall: { label: HALL_DOOR },
  coEditors: { label: CO_EDITORS_DOOR },
  history: { label: HISTORY_DOOR },
  settings: { label: SETTINGS_DOOR, meta: SETTINGS_DOOR_META },
};

const MUSIC_SOURCES = { workingMix: 'Arbeitsmix', finalTrack: 'Endfassung' } as const;

const READINESS_LABELS: Record<ReadinessKey, string> = {
  music: 'Lieder',
  steps: 'Schritte',
  places: 'Aufstellung',
  movement: 'Bewegung',
  video: 'Video',
  final: 'Endfassung',
};

const FLAG_LABELS: Record<ScoreStepFlag, string> = {
  cutAway: 'weggeschnitten',
  musicMissing: 'Musik fehlt',
};

const stripDot = (value: string): string => value.replace('.,', '');

export const clockOf = (seconds: number): string => {
  const whole = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(whole / SECONDS_PER_MINUTE);

  return `${minutes}:${String(whole % SECONDS_PER_MINUTE).padStart(PAD, '0')}`;
};

export const rangeTextOf = (range: TimelineRange | null): string =>
  range === null ? '' : `${clockOf(range.start)}–${clockOf(range.end)}`;

export const countsTextOf = (counts: ScoreCounts | null): string => {
  if (counts === null) {
    return '';
  }
  if (counts.eights === 0) {
    return `${counts.rest} Zählzeiten`;
  }

  return counts.rest === 0 ? `${counts.eights}×8` : `${counts.eights}×8+${counts.rest}`;
};

export const flagTextOf = (flag: ScoreStepFlag): string => FLAG_LABELS[flag];

export const stepTitleOf = (number: number, name: string): string =>
  name.trim() === '' ? `Schritt ${number}` : name;

export const musicSourceOf = (source: keyof typeof MUSIC_SOURCES): string => MUSIC_SOURCES[source];

export const musicFactOf = (source: keyof typeof MUSIC_SOURCES, length: number): string =>
  length <= 0 ? NONE : `${MUSIC_SOURCES[source]} · ${clockOf(length)}`;

export const dayOf = (iso: string): string => stripDot(WEEKDAY_DATE.format(new Date(iso)));

export const dayClockOf = (iso: string): string => `${dayOf(iso)} ${CLOCK.format(new Date(iso))}`;

export const numberTextOf = (number: number | null): string =>
  number === null ? 'Nr. offen' : `Nr. ${number}`;

export const eveningFactOf = (title: string, number: number | null, iso: string): string =>
  `${numberTextOf(number)} · ${title} · ${dayOf(iso)}`;

export const eveningHintOf = (title: string, number: number | null, iso: string): string =>
  `${title}, ${dayOf(iso)}, ${numberTextOf(number)}`;

export const sessionTextOf = (year: number): string =>
  `Session ${year}/${String((year + 1) % 100).padStart(PAD, '0')}`;

export const introOf = (pieces: readonly (string | null)[]): string =>
  pieces.filter((piece) => piece !== null && piece !== '').join(' · ');

export const practiseMetaOf = (number: number, name: string): string =>
  `weiter bei ${number} · ${stepTitleOf(number, name)}`;

export const partHintOf = (name: string): string => `${name}: zu den Schritten`;

export const ownPlaceLabelOf = (number: number): string => `Dein Platz ${number} zu Beginn`;

export const readinessLabelOf = (key: ReadinessKey): string => READINESS_LABELS[key];

export const readinessValueOf = (item: ReadinessItem): string => {
  if (item.key === 'final') {
    if (item.state === 'done') {
      return 'da';
    }

    return item.state === 'open' ? 'nicht übernommen' : NONE;
  }
  if (item.total === 0) {
    return NONE;
  }

  return item.key === 'music' || item.key === 'steps'
    ? `${item.done} von ${item.total}`
    : `${item.done}/${item.total}`;
};

export const readinessHintOf = (item: ReadinessItem): string =>
  `${readinessLabelOf(item.key)}: ${readinessValueOf(item)}, öffnen`;

export const stepContextOf = (range: string, counts: string, part: string | null): string =>
  [range, counts, part].filter((piece) => piece !== null && piece !== '').join(' · ');

export const partRangeTextOf = (range: TimelineRange | null, steps: number): string =>
  [rangeTextOf(range), `${steps} ${steps === 1 ? 'Schritt' : 'Schritte'}`]
    .filter((piece) => piece !== '')
    .join(' · ');

export const stepStateTextOf = (movement: boolean, video: boolean): string =>
  [movement ? 'Bewegung' : 'ohne Bewegung', video ? 'Video' : 'ohne Video'].join(' · ');

export const glyphsLabelOf = (
  movement: boolean,
  video: boolean,
  flag: ScoreStepFlag | null,
): string =>
  [
    movement ? 'Bewegung geplant' : null,
    video ? 'im Trainervideo' : null,
    flag === null ? null : flagTextOf(flag),
  ]
    .filter((piece) => piece !== null)
    .join(', ');
