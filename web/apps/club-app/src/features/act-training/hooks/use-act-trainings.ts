import type { KkLinkSearch } from '@furria/ui/kk-link-search';
import type { KkPanelAction } from '@furria/ui/panel-action';
import { Link } from '@tanstack/react-router';
import { spotPathsOf } from '@/features/act-player/choreography-motion';
import { timedStepsOf } from '@/features/act-player/hooks/use-studio-playback';
import { musicSegmentsOf } from '@/features/act-player/music-timeline';
import { canPractise } from '@/features/acts/act-studio';
import type { Studio } from '@/features/acts/schemas';
import { TRAINING_START, trainingOpenHintOf, trainingRowMetaOf } from '../training-copy';
import { trainingRollOf } from '../training-gaps';

const CURRENT_ROUTE = '.';
const TRAINING_VIEW = 'training';

export interface ActTrainingRow {
  calendarEntryId: number;
  label: string;
  meta: string;
  hint: string | undefined;
  to: string | null;
  search: KkLinkSearch;
}

export interface ActTrainings {
  rows: ActTrainingRow[];
  start: KkPanelAction | undefined;
}

const searchOf =
  (calendarEntryId: number | null): KkLinkSearch =>
  ({ settings: _settings, edit: _edit, evening: _evening, training: _training, ...kept }) =>
    calendarEntryId === null
      ? { ...kept, view: TRAINING_VIEW }
      : { ...kept, view: TRAINING_VIEW, training: calendarEntryId };

export const useActTrainings = (studio: Studio): ActTrainings => {
  const practisable = canPractise(studio);
  const paths = spotPathsOf(studio.choreography, musicSegmentsOf(studio));
  const steps = timedStepsOf(studio.steps);

  return {
    rows: studio.trainings.map((training) => {
      const roll = trainingRollOf(training, studio.spots, paths, steps);

      return {
        calendarEntryId: training.calendarEntryId,
        label: training.title,
        meta: trainingRowMetaOf(training, roll),
        hint: roll.gaps.length === 0 ? undefined : trainingOpenHintOf(roll.gaps.length),
        to: practisable ? CURRENT_ROUTE : null,
        search: searchOf(training.calendarEntryId),
      };
    }),
    start: practisable
      ? {
          label: TRAINING_START,
          icon: 'play',
          component: Link,
          to: CURRENT_ROUTE,
          search: searchOf(null),
        }
      : undefined,
  };
};
