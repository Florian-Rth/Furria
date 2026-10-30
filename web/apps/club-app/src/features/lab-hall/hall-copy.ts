import { toEveningDay } from '@/features/acts/act-evenings-copy';
import type { StudioTraining } from '@/features/acts/schemas';

export const HALL_LABEL = 'Training in der Halle';
export const HALL_FALLBACK_TITLE = 'Halle';
export const HALL_DENIED = 'Diesen Auftritt kannst du nicht üben.';
export const HALL_CLOSED = 'Für diesen Auftritt gibt es noch nichts zum Üben.';
export const HALL_CLOSE = 'Training beenden';
export const HALL_END = 'Ende';
export const HALL_BACK = 'Zurück';
export const HALL_NEXT = 'Weiter';
export const HALL_PLAY = 'Start';
export const HALL_PAUSE = 'Stopp';
export const HALL_LOOP = 'Schleife';
export const HALL_LOOP_LABEL = 'Diesen Schritt wiederholen';
export const HALL_TEMPO_LABEL = 'Tempo umschalten';
export const HALL_VIDEO = 'Video';
export const HALL_VIDEO_LABEL = 'Trainervideo zeigen';
export const HALL_STAGE_LABEL = 'Bühne mit allen Plätzen';
export const HALL_FRONT = 'Vorne';
export const HALL_FRONT_AUDIENCE = 'Vorne · Publikum';
export const HALL_ALL_HERE = 'Alle da';
export const HALL_NO_TRAINING = 'Kein Training geplant';
export const HALL_NO_STEP = 'Noch keine Schritte';
export const HALL_LAST_STEP = 'Letzter Schritt';
export const HALL_PAD_LABEL = 'Abspielen oder anhalten';

export const hallTempoCaptionOf = (rate: number): string => `${Math.round(rate * 100)} %`;

export const hallNextOf = (name: string | null): string =>
  name === null ? HALL_LAST_STEP : `Danach: ${name}`;

export const hallCountLabelOf = (count: number | null, leading: boolean): string => {
  if (count === null) {
    return 'Keine Zählzeit';
  }

  return leading ? `Einzählen: ${count}` : `Zählzeit ${count} von 8`;
};

export const hallAbsentTitleOf = (training: StudioTraining | null): string =>
  training === null ? HALL_NO_TRAINING : `Fehlt ${toEveningDay(training.startsAt)}`;

export const hallAbsentNoneOf = (training: StudioTraining | null): string =>
  training === null ? 'Alle Plätze wie geplant' : HALL_ALL_HERE;
