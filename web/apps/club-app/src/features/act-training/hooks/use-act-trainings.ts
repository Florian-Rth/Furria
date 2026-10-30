import type { KkLinkSearch } from '@furria/ui/kk-link-search';
import type { KkPanelAction } from '@furria/ui/panel-action';
import { Link } from '@tanstack/react-router';
import { spotPathsOf } from '@/features/act-player/choreography-motion';
import { timedStepsOf } from '@/features/act-player/hooks/use-studio-playback';
import { musicSegmentsOf } from '@/features/act-player/music-timeline';
import { canPractise } from '@/features/acts/act-studio';
import type { Studio } from '@/features/acts/schemas';
import type { CastPerson } from '@/features/running-order/schemas';
import { attendanceTallyOf, castAttendanceOf } from '../training-attendance';
import { TRAINING_START, trainingOpenHintOf, trainingRowMetaOf } from '../training-copy';
import { trainingGapsOf } from '../training-gaps';

const CURRENT_ROUTE = '.';
const TRAINING_VIEW = 'training';
const DETAILS_VIEW = 'details';

export interface ActTrainingRow {
  calendarEntryId: number;
  label: string;
  meta: string;
  hint: string | undefined;
  to: string;
  search: KkLinkSearch;
}

export interface ActTrainings {
  rows: ActTrainingRow[];
  start: KkPanelAction | undefined;
}

const trainingSearchOf =
  (calendarEntryId: number | null): KkLinkSearch =>
  ({
    settings: _settings,
    edit: _edit,
    evening: _evening,
    training: _training,
    roll: _roll,
    ...kept
  }) =>
    calendarEntryId === null
      ? { ...kept, view: TRAINING_VIEW }
      : { ...kept, view: TRAINING_VIEW, training: calendarEntryId };

const rollSearchOf =
  (calendarEntryId: number): KkLinkSearch =>
  ({ settings: _settings, evening: _evening, edit: _edit, training: _training, ...kept }) => ({
    ...kept,
    view: DETAILS_VIEW,
    roll: calendarEntryId,
  });

export const useActTrainings = (studio: Studio, cast: readonly CastPerson[]): ActTrainings => {
  const paths = spotPathsOf(studio.choreography, musicSegmentsOf(studio));
  const steps = timedStepsOf(studio.steps);

  return {
    rows: studio.trainings.map((training) => {
      const gaps = trainingGapsOf(training, studio.spots, paths, steps);
      const tally = attendanceTallyOf(castAttendanceOf(cast, training));

      return {
        calendarEntryId: training.calendarEntryId,
        label: training.title,
        meta: trainingRowMetaOf(training, tally, gaps),
        hint: gaps.length === 0 ? undefined : trainingOpenHintOf(gaps.length),
        to: CURRENT_ROUTE,
        search: rollSearchOf(training.calendarEntryId),
      };
    }),
    start: canPractise(studio)
      ? {
          label: TRAINING_START,
          icon: 'play',
          component: Link,
          to: CURRENT_ROUTE,
          search: trainingSearchOf(null),
        }
      : undefined,
  };
};
