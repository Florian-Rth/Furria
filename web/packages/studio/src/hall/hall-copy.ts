import { COUNT_IN_BEATS } from '@furria/studio/count-in';
import type { HallAbsence, HallTraining } from '@furria/studio/hall-scene';
import { openSpotsTextOf } from '@furria/studio/practice-copy';
import { keyHelpOf } from '@furria/studio/studio-keys';
import type { KkKeyListEntry } from '@furria/ui/KkKeyList';

export const HALL_LABEL = 'Training in der Halle';
export const HALL_CLOSE = 'Training beenden';
export const HALL_BACK = 'Zurück';
export const HALL_NEXT = 'Weiter';
export const HALL_PLAY = 'Start';
export const HALL_PAUSE = 'Stopp';
export const HALL_LOOP = 'Schleife';
export const HALL_LOOP_LABEL = 'Diesen Schritt wiederholen';
export const HALL_TEMPO_LABEL = 'Tempo umschalten';
export const HALL_COUNT_IN = 'Einzählen';
export const HALL_COUNT_IN_LABEL = `Vor jedem Start ${COUNT_IN_BEATS} Schläge einzählen`;
export const HALL_VIDEO = 'Video';
export const HALL_VIDEO_LABEL = 'Trainervideo zeigen';
export const HALL_FRONT = 'Vorne';
export const HALL_ALL_HERE = 'Alle da';
export const HALL_NO_TRAINING = 'Kein Training geplant';
export const HALL_NO_STEP = 'Noch keine Schritte';
export const HALL_LAST_STEP = 'Letzter Schritt';
export const HALL_KEYS_TITLE = 'Tastatur';
export const HALL_KEYS_LABEL = 'Wiedergabe';
export const HALL_KEYS: readonly KkKeyListEntry[] = keyHelpOf([
  { id: 'toggle', commands: ['toggle'], action: 'Start oder Stopp' },
  { id: 'step', commands: ['stepBack', 'stepForward'], action: 'Schritt zurück oder weiter' },
  { id: 'tempo', commands: ['faster', 'slower'], action: 'Tempo 100 % oder 75 %' },
  { id: 'loop', commands: ['loop'], action: 'Schritt in Schleife' },
]);

const TRAINING_DAY = new Intl.DateTimeFormat('de-DE', {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
  timeZone: 'Europe/Berlin',
});

const HALL_STAGE_LABEL = 'Bühne aus Sicht der Tanzenden, vorne oben';

export const hallTempoCaptionOf = (rate: number): string => `${Math.round(rate * 100)} %`;

export const hallStepMetaOf = (
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

export const hallNextOf = (name: string | null): string =>
  name === null ? HALL_LAST_STEP : `Danach: ${name}`;

export const hallCountLabelOf = (count: number | null, leading: boolean): string => {
  if (count === null) {
    return 'Keine Zählzeit';
  }

  return leading ? `Einzählen: ${count}` : `Zählzeit ${count} von 8`;
};

export const hallAbsentTitleOf = (training: HallTraining | null): string =>
  training === null
    ? HALL_NO_TRAINING
    : `Fehlt ${TRAINING_DAY.format(new Date(training.startsAt))}`;

export const hallAbsentNoneOf = (training: HallTraining | null): string =>
  training === null ? 'Alle Plätze wie geplant' : HALL_ALL_HERE;

const absentTextOf = (absences: readonly HallAbsence[]): string | null => {
  if (absences.length === 0) {
    return null;
  }

  const verb = absences.length === 1 ? 'Es fehlt' : 'Es fehlen';
  const names = absences.map((absence) => `${absence.name} auf Platz ${absence.number}`);

  return `${verb} ${names.join(', ')}`;
};

export const hallStageLabelOf = (
  absences: readonly HallAbsence[],
  open: readonly number[],
): string =>
  [HALL_STAGE_LABEL, absentTextOf(absences), openSpotsTextOf(open)]
    .filter((part) => part !== null)
    .join('. ');
