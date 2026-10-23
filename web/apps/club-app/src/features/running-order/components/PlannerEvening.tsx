import { KkNumberedList } from '@furria/ui/KkNumberedList';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import { usePlanner } from '../planner-context';
import { EVENING_EMPTY, LIST_LABEL } from '../planner-copy';
import type { PlannerEntry } from '../planner-rows';
import { PlannerLineRow } from './PlannerLineRow';
import { PlannerRailRow } from './PlannerRailRow';
import { PlannerUnplaced } from './PlannerUnplaced';

const rowOf = (entry: PlannerEntry) => {
  if (entry.type === 'rail') {
    return <PlannerRailRow key={entry.key} rail={entry} />;
  }
  return <PlannerLineRow key={entry.key} entry={entry} />;
};

export const PlannerEvening: FC = () => {
  const planner = usePlanner();
  const entries = planner.entries;
  const rows = entries.map(rowOf);
  const empty =
    entries.length === 0 ? <KkNumberedList.Empty>{EVENING_EMPTY}</KkNumberedList.Empty> : null;

  return (
    <Box ref={planner.drag.listRef} sx={{ minWidth: 0 }}>
      <KkNumberedList label={LIST_LABEL}>
        {rows}
        {empty}
        <PlannerUnplaced />
      </KkNumberedList>
    </Box>
  );
};
