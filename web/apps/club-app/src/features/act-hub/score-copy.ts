import { clockOf } from '@furria/studio/score-copy';
import type { ScoreDoorKey } from './score-doors';
import type { ReadinessItem, ReadinessKey } from './score-readiness';

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

export const READINESS_LABEL = 'Stand';
export const FACTS_LABEL = 'Das Nächste';
export const EVENINGS_TITLE = 'Abende';
export const EDIT_LABEL = 'Bearbeiten';
export const EDIT_DRAWER_LABEL = 'Bearbeiten';
export const TRAINING_FACT = 'Training';
export const EVENING_FACT = 'Abend';
export const MUSIC_FACT = 'Musik';
export const NONE = 'keine';
export const ANSWER_YES = 'Bin da';
export const ANSWER_NO = 'Kann nicht';
export const ANSWER_LABEL = 'Deine Antwort zum Training';
export const TRAININGS_HINT = 'Alle Trainings und Anwesenheit';
export const NUMBER_LABEL = 'Nr.';
export const OPEN_NUMBER = 'offen';
export const EDIT_DOORS_TITLE = 'Alles bearbeiten';
export const READINESS_TITLE = 'Stand';
export const STUDIO_DOOR = 'Im Studio bearbeiten';
export const MUSIC_DOOR = 'Musik & Video';
export const EVENINGS_DOOR = 'Abende';
export const TRAININGS_DOOR = 'Trainings & Anwesenheit';
export const HALL_DOOR = 'Training starten';
export const SETTINGS_DOOR = 'Einstellungen';
export const STUDIO_DOOR_META = 'Schritte, Plätze, Bewegung';
export const MUSIC_DOOR_META = 'Lieder, Endfassung, Videos';
export const EVENINGS_DOOR_META = 'Dabei sein, Besetzung je Abend';
export const SETTINGS_DOOR_META = 'Name, Besetzung, Wünsche, Archiv';
export const NO_STUDIO = 'Die Einzelheiten sehen nur die Besetzung und die Gruppenleitung.';

export const DOOR_COPY: Record<ScoreDoorKey, { label: string; meta?: string }> = {
  studio: { label: STUDIO_DOOR, meta: STUDIO_DOOR_META },
  music: { label: MUSIC_DOOR, meta: MUSIC_DOOR_META },
  evenings: { label: EVENINGS_DOOR, meta: EVENINGS_DOOR_META },
  trainings: { label: TRAININGS_DOOR },
  hall: { label: HALL_DOOR },
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

const stripDot = (value: string): string => value.replace('.,', '');

export const musicFactOf = (source: keyof typeof MUSIC_SOURCES, length: number): string =>
  length <= 0 ? NONE : `${MUSIC_SOURCES[source]} · ${clockOf(length)}`;

export const dayOf = (iso: string): string => stripDot(WEEKDAY_DATE.format(new Date(iso)));

export const dayClockOf = (iso: string): string => `${dayOf(iso)} ${CLOCK.format(new Date(iso))}`;

const numberTextOf = (number: number | null): string =>
  number === null ? 'Nr. offen' : `Nr. ${number}`;

export const eveningFactOf = (title: string, number: number | null, iso: string): string =>
  `${numberTextOf(number)} · ${title} · ${dayOf(iso)}`;

export const eveningHintOf = (title: string, number: number | null, iso: string): string =>
  `${title}, ${dayOf(iso)}, ${numberTextOf(number)}`;

export const sessionTextOf = (year: number): string =>
  `Session ${year}/${String((year + 1) % 100).padStart(PAD, '0')}`;

export const introOf = (pieces: readonly (string | null)[]): string =>
  pieces.filter((piece) => piece !== null && piece !== '').join(' · ');

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
