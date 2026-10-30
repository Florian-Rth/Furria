import { KkFacetList } from '@furria/ui/KkFacetList';
import { KkMeta } from '@furria/ui/KkMeta';
import type { FC } from 'react';
import { NONE } from '../act-card-copy';
import type { ActCardView } from '../act-card-view';
import { ActCardTrainingRow } from './ActCardTrainingRow';

const LIST_LABEL = 'Trainings dieser Session';

interface ActCardTrainingsListProps {
  view: ActCardView;
}

export const ActCardTrainingsList: FC<ActCardTrainingsListProps> = ({ view }) => {
  if (view.trainings.length === 0) {
    return <KkMeta>{NONE}</KkMeta>;
  }

  const nextId = view.nextTraining?.calendarEntryId ?? null;
  const rows = view.trainings.map((training) => (
    <ActCardTrainingRow
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
