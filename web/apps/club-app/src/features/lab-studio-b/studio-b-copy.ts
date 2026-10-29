import type { KkScreenOrigin } from '@furria/ui/screen-declaration';

export const STUDIO_B_ORIGIN: KkScreenOrigin = { label: 'Labor', to: '/lab' };
export const STUDIO_B_FALLBACK_TITLE = 'Auftritt üben';
export const STUDIO_B_LOADING_LABEL = 'Auftritt wird geladen';
export const STUDIO_B_RETRY_LABEL = 'Erneut laden';
export const STUDIO_B_NO_STUDIO_TITLE = 'Nur für die Besetzung';
export const STUDIO_B_NO_STUDIO_LINE =
  'Musik, Schritte und Trainervideos sieht, wer im Auftritt mittanzt oder ihn betreut.';
export const STUDIO_B_NO_STEPS_TITLE = 'Noch keine Schritte';
export const STUDIO_B_NO_STEPS_LINE =
  'Sobald Schritte auf der Musik liegen, steht hier die Schrittfolge zum Üben.';

export const MANUAL_LABEL = 'Schrittfolge';
export const CARD_LABEL = 'Aktueller Schritt';
export const PREVIOUS_STEP_LABEL = 'Schritt davor';
export const NEXT_STEP_LABEL = 'Nächster Schritt';
export const NO_DESCRIPTION = 'Keine Beschreibung';
export const LOOSE_NOTE = 'nicht in der Musik';
export const LATER_LINE = 'Bearbeiten, offline üben und Trainingsmodus kommen noch.';
export const WITHOUT_PART = 'Ohne Teil';

export const STAGE_LABEL = 'Bühne mit allen Plätzen';
export const AUDIENCE_LABEL = 'Publikum';
export const NO_VIDEO_LABEL = 'Kein Trainervideo an dieser Stelle';
export const MIRRORED_LABEL = 'Gespiegelt';
export const COUNT_LABEL = 'Zählzeit und Achter';

export const TRANSPORT_LABEL = 'Wiedergabe';
export const PLAY_LABEL = 'Abspielen';
export const PAUSE_LABEL = 'Anhalten';
export const LOOP_STEP_LABEL = 'Schritt';
export const LOOP_PART_LABEL = 'Teil';
export const SPEED_LABEL = 'Tempo';
export const SLOWER_LABEL = 'Langsamer';
export const FASTER_LABEL = 'Schneller';
export const STRIP_LABEL = 'Ganzer Tanz';
export const MUSIC_LOADING_LINE = 'Musik lädt …';
export const MUSIC_FAILED_LINE = 'Musik konnte nicht geladen werden.';
export const MUSIC_RETRY_LABEL = 'Nochmal';

export const stepNumberOf = (number: number): string => String(number).padStart(2, '0');

export const ownSpotLineOf = (spotNumber: number): string => `Dein Platz ${spotNumber}`;

export const stepsCountOf = (count: number): string =>
  count === 1 ? '1 Schritt' : `${count} Schritte`;

export const spotsLineOf = (spots: number, open: number): string =>
  open === 0 ? `${spots} Plätze` : `${spots} Plätze · ${open} offen`;

export const eightLineOf = (eight: number | null, eights: number): string =>
  eight === null ? 'ohne Zählzeiten' : `Achter ${eight + 1}/${eights}`;

export const stepLabelOf = (number: number, name: string, range: string): string =>
  `Schritt ${number}, ${name}, ${range}`;
