import type { TimelineRange } from '@furria/studio/music-timeline';
import type { ScoreCounts, ScoreStepFlag } from '@furria/studio/score-steps';

const SECONDS_PER_MINUTE = 60;
const PAD = 2;

export const SCORE_LABEL = 'Musik mit Teilen und Schritten';
export const MANUAL_LABEL = 'Schritte nach Teilen';
export const FOR_YOU_TITLE = 'Für dich';
export const NEXT_TITLE = 'Als Nächstes';
export const PLACE_LABEL = 'Platz';
export const PRACTISE_LABEL = 'Üben';
export const PLAY_LABEL = 'Abspielen';
export const PAUSE_LABEL = 'Anhalten';
export const LENS_LABEL = 'Ausschnitt';
export const WHOLE_LABEL = 'Ganz';
export const CLOSE_LABEL = 'Schließen';
export const PRACTISE_FROM_HERE = 'Üben ab hier';
export const EDIT_FROM_HERE = 'Bearbeiten ab hier';
export const FORMATION_TITLE = 'Aufstellung';
export const VIDEO_TITLE = 'Trainervideo';
export const DESCRIPTION_TITLE = 'Beschreibung';
export const NO_DESCRIPTION = 'keine';
export const NO_VIDEO = 'keins an dieser Stelle';
export const NO_FORMATION = 'noch keine';
export const AUDIENCE_LABEL = 'Publikum';
export const OPEN_SPOT = 'offen';
export const LOOSE_STEPS = 'Ohne Teil';
export const NO_STEPS = 'Noch keine Schritte';
export const NO_MUSIC = 'Noch keine Musik';
export const MOVEMENT_KEY = 'Bewegung';
export const VIDEO_KEY = 'Video';
export const STEP_PANE_LABEL = 'Schritt';

const FLAG_LABELS: Record<ScoreStepFlag, string> = {
  cutAway: 'weggeschnitten',
  musicMissing: 'Musik fehlt',
};

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

export const practiseMetaOf = (number: number, name: string): string =>
  `weiter bei ${number} · ${stepTitleOf(number, name)}`;

export const partHintOf = (name: string): string => `${name}: zu den Schritten`;

export const ownPlaceLabelOf = (number: number): string => `Dein Platz ${number} zu Beginn`;

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
