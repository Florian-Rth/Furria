import { KkNumberedList } from '@furria/ui/KkNumberedList';
import type { FC } from 'react';
import type { DraftLine } from '@/features/running-order/types';
import { usePlanner } from '../planner-context';
import { PLACES_TITLE } from '../planner-copy';
import { placeOptionsOf } from '../planner-fixes';
import { PlannerDetailSection } from './PlannerDetailSection';
import { PlannerPlaceRow } from './PlannerPlaceRow';

interface PlannerPlacesProps {
  line: DraftLine;
}

export const PlannerPlaces: FC<PlannerPlacesProps> = ({ line }) => {
  const planner = usePlanner();
  const pinnedUnit = line.pinned && line.placed;

  if (pinnedUnit) {
    return null;
  }

  const rows = placeOptionsOf(planner.draft, line.key).map((option) => (
    <PlannerPlaceRow key={option.to} line={line} option={option} />
  ));

  return (
    <PlannerDetailSection title={PLACES_TITLE}>
      <KkNumberedList label={PLACES_TITLE}>{rows}</KkNumberedList>
    </PlannerDetailSection>
  );
};
