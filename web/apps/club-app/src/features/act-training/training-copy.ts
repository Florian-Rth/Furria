import { toEveningDay } from '@/features/acts/act-evenings-copy';
import type { StudioTraining } from '@/features/acts/schemas';
import type { TrainingGap, TrainingRoll } from './training-gaps';

export const TRAINING_LABEL = 'Training';
export const TRAINING_SCREEN_LABEL = 'Training in der Halle';
export const TRAINING_BACK = 'Schritt zurück';
export const TRAINING_LOOP = 'Schritt wiederholen';
export const TRAINING_PLAY = 'Abspielen';
export const TRAINING_PAUSE = 'Anhalten';
export const TRAINING_NO_STEP = 'Noch keine Schritte';
export const TRAININGS_TITLE = 'Trainings';
export const TRAININGS_NOTE =
  'Eine Absage lässt den Platz offen. Genannt sind die Schritte, in denen er sich bewegt.';
export const TRAININGS_EMPTY = 'In dieser Session steht kein Training mehr an.';
export const TRAINING_START = 'Training starten';

const TIME = new Intl.DateTimeFormat('de-DE', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Berlin',
});

export const trainingTitleOf = (training: StudioTraining | null): string =>
  training === null ? TRAINING_LABEL : `${training.title} · ${toEveningDay(training.startsAt)}`;

export const trainingTallyOf = (
  training: StudioTraining | null,
  roll: TrainingRoll,
): string | null =>
  training?.asksForResponse === true ? `${roll.present} von ${roll.expected} da` : null;

const gapOf = (gap: TrainingGap): string => {
  const steps = gap.stepNumbers.length === 0 ? '' : ` · Schritt ${gap.stepNumbers.join(', ')}`;

  return `Platz ${gap.number} (${gap.firstName})${steps}`;
};

export const trainingGapsTextOf = (gaps: readonly TrainingGap[]): string | null =>
  gaps.length === 0 ? null : `Offen: ${gaps.map(gapOf).join(' · ')}`;

export const trainingRowMetaOf = (training: StudioTraining, roll: TrainingRoll): string => {
  const when = `${toEveningDay(training.startsAt)}, ${TIME.format(new Date(training.startsAt))}`;
  const tally = trainingTallyOf(training, roll);
  const gaps = trainingGapsTextOf(roll.gaps);

  return [when, tally, gaps].filter((part) => part !== null).join(' · ');
};

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
