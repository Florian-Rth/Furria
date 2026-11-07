import { spotPathsOf } from '@furria/studio/choreography-motion';
import { canPractise, musicSegmentsOf } from '@furria/studio/music-timeline';
import { timedStepsOf } from '@furria/studio/use-studio-playback';
import type { KkLinkSearch } from '@furria/ui/kk-link-search';
import type { KkPanelAction } from '@furria/ui/panel-action';
import { Link } from '@tanstack/react-router';
import { actScreenPathOf, startedHallOf } from '@/features/acts/act-screens';
import { originLinkSearchOf } from '@/features/acts/acts-origin';
import type { ActStudio } from '@/features/acts/schemas';
import type { CastPerson } from '@/features/running-order/schemas';
import { attendanceTallyOf, castAttendanceOf } from '../training-attendance';
import { TRAINING_START, trainingOpenHintOf, trainingRowMetaOf } from '../training-copy';
import { trainingGapsOf } from '../training-gaps';

const CURRENT_ROUTE = '.';
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

const rollSearchOf =
  (calendarEntryId: number): KkLinkSearch =>
  ({ settings: _settings, evening: _evening, ...kept }) => ({
    ...kept,
    view: DETAILS_VIEW,
    roll: calendarEntryId,
  });

export const useActTrainings = (
  actId: number,
  studio: ActStudio,
  cast: readonly CastPerson[],
): ActTrainings => {
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
          to: actScreenPathOf(actId, startedHallOf(studio.trainings)),
          search: originLinkSearchOf,
        }
      : undefined,
  };
};
