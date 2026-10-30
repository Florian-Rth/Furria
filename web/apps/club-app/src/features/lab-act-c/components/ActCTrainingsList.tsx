import { KkFacetList } from '@furria/ui/KkFacetList';
import { KkMeta } from '@furria/ui/KkMeta';
import type { FC } from 'react';
import { NONE } from '../act-c-copy';
import type { ActCView } from '../act-c-view';
import { ActCTrainingRow } from './ActCTrainingRow';

const LIST_LABEL = 'Trainings dieser Session';

interface ActCTrainingsListProps {
  view: ActCView;
}

export const ActCTrainingsList: FC<ActCTrainingsListProps> = ({ view }) => {
  if (view.trainings.length === 0) {
    return <KkMeta>{NONE}</KkMeta>;
  }

  const nextId = view.nextTraining?.calendarEntryId ?? null;
  const rows = view.trainings.map((training) => (
    <ActCTrainingRow
      key={training.calendarEntryId}
      training={training}
      viewerId={view.viewerId}
      inCast={view.inCast}
      castSize={view.cast.length}
      current={training.calendarEntryId === nextId}
    />
  ));

  return <KkFacetList label={LIST_LABEL}>{rows}</KkFacetList>;
};
