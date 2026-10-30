import { toEveningDay } from '@/features/acts/act-evenings-copy';
import type { StudioAttendance, StudioTraining } from '@/features/acts/schemas';
import type { AttendanceAnswer } from '@/features/attendance/schemas';
import type { AttendanceTally, MarkedAnswer, TrailStep } from './training-attendance';
import type { TrainingGap } from './training-gaps';

export const TRAINING_LABEL = 'Training';
export const TRAINING_SCREEN_LABEL = 'Training in der Halle';
export const TRAINING_BACK = 'Schritt zurück';
export const TRAINING_LOOP = 'Schritt wiederholen';
export const TRAINING_PLAY = 'Abspielen';
export const TRAINING_PAUSE = 'Anhalten';
export const TRAINING_NO_STEP = 'Noch keine Schritte';
export const TRAININGS_TITLE = 'Trainings';
export const TRAININGS_NOTE =
  'Jedes Training fragt die Besetzung. Eine Absage lässt den Platz offen.';
export const ROLL_PANE_LABEL = 'Wer ist da';
export const ROLL_GRID_TITLE = 'Besetzung';
export const ROLL_GRID_LABEL = 'Besetzung beim Training';
export const ROLL_MARK_NOTE = 'Tippe auf einen Namen, um ihn als da oder nicht da einzutragen.';
export const ROLL_READ_NOTE = 'Eintragen kann die Leitung der Gruppe.';
export const ROLL_TRAIL_TITLE = 'Verlauf';
export const ROLL_UNDO = 'Rückgängig';
export const ROLL_MAYBE_BADGE = '?';
export const TRAININGS_EMPTY = 'In dieser Session steht kein Training mehr an.';
export const TRAINING_START = 'Training starten';

const TIME = new Intl.DateTimeFormat('de-DE', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Berlin',
});

export const trainingTitleOf = (training: StudioTraining | null): string =>
  training === null ? TRAINING_LABEL : `${training.title} · ${toEveningDay(training.startsAt)}`;

export const trainingTallyOf = (tally: AttendanceTally): string =>
  `${tally.present} von ${tally.expected} da`;

const gapOf = (gap: TrainingGap): string => {
  const steps = gap.stepNumbers.length === 0 ? '' : ` · Schritt ${gap.stepNumbers.join(', ')}`;

  return `Platz ${gap.number} (${gap.firstName})${steps}`;
};

export const trainingGapsTextOf = (gaps: readonly TrainingGap[]): string | null =>
  gaps.length === 0 ? null : `Offen: ${gaps.map(gapOf).join(' · ')}`;

const openSpotsOf = (gaps: readonly TrainingGap[]): string | null =>
  gaps.length === 0 ? null : gaps.map((gap) => `Platz ${gap.number} offen`).join(' · ');

export const trainingWhenOf = (training: StudioTraining): string =>
  `${toEveningDay(training.startsAt)}, ${TIME.format(new Date(training.startsAt))}`;

export const trainingRowMetaOf = (
  training: StudioTraining,
  tally: AttendanceTally,
  gaps: readonly TrainingGap[],
): string =>
  [trainingWhenOf(training), trainingTallyOf(tally), openSpotsOf(gaps)]
    .filter((part) => part !== null)
    .join(' · ');

export const trainingStepMetaOf = (
  position: number | null,
  total: number,
  partName: string | null,
): string | null => {
  if (position === null) {
    return partName;
  }

  const step = `Schritt ${position} von ${total}`;

  return partName === null ? step : `${step} · ${partName}`;
};

export const trainingCountLabelOf = (count: number | null): string =>
  count === null ? 'Keine Zählzeit' : `Zählzeit ${count} von 8`;

export const trainingOpenHintOf = (open: number): string => `${open} offen`;

const ANSWER_WORDS: Record<AttendanceAnswer, string> = {
  yes: 'zugesagt',
  maybe: 'vielleicht',
  no: 'abgesagt',
};

const voiceOf = (step: TrailStep): string =>
  step.voice === 'self' ? 'selbst' : `eingetragen von ${step.recordedBy ?? 'der Leitung'}`;

export const rollTileLabelOf = (response: StudioAttendance | null): string => {
  if (response === null) {
    return 'keine Antwort, zählt als da';
  }

  const answer = ANSWER_WORDS[response.answer];

  return response.isRecordedOnBehalf
    ? `${answer}, eingetragen von ${response.recordedBy ?? 'der Leitung'}`
    : answer;
};

export const rollTrailLineOf = (name: string, steps: readonly TrailStep[]): string =>
  `${name}: ${steps.map((step) => `${ANSWER_WORDS[step.answer]} (${voiceOf(step)})`).join(' · vorher ')}`;

export const rollMarkedMessageOf = (name: string, answer: MarkedAnswer): string =>
  answer === 'no' ? `${name} ist als nicht da eingetragen.` : `${name} ist als da eingetragen.`;
