import { KkButton } from '@furria/ui/KkButton';
import { KkNumberedList } from '@furria/ui/KkNumberedList';
import type { FC } from 'react';
import { usePlanner } from '../planner-context';
import { PLACE_ALL_LABEL, UNPLACED_TITLE } from '../planner-copy';
import { PlannerUnplacedRow } from './PlannerUnplacedRow';

export const PlannerUnplaced: FC = () => {
  const planner = usePlanner();

  if (planner.unplaced.length === 0) {
    return null;
  }

  const rows = planner.unplaced.map((line) => <PlannerUnplacedRow key={line.key} line={line} />);
  const placeAll =
    planner.unplaced.length < 2 || planner.suggestion.isActive ? null : (
      <KkButton size="small" variant="text" onClick={planner.placeAll}>
        {PLACE_ALL_LABEL}
      </KkButton>
    );

  return (
    <>
      <KkNumberedList.Section
        title={UNPLACED_TITLE}
        meta={planner.unplaced.length}
        action={placeAll}
      />
      {rows}
    </>
  );
};
