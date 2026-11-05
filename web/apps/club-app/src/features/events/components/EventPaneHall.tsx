import { KkCheckLine } from '@furria/ui/KkCheckLine';
import { KkNote } from '@furria/ui/KkNote';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { hallChecksOf } from '../hall-step';
import {
  CHAIRS_CHECK_LABEL,
  NO_HALL_PLANNER_NOTE,
  PLAN_CHECK_LABEL,
  SKIPPED_LABEL,
  SKIPPED_VALUE,
  TABLES_CHECK_LABEL,
  toChairsValue,
  toPlanValue,
  toTablesValue,
} from '../hall-step-copy';
import { useEventsWorkbench } from '../hooks/use-events-workbench';
import type { EventDetails } from '../schemas';

interface EventPaneHallProps {
  event: EventDetails;
}

export const EventPaneHall: FC<EventPaneHallProps> = ({ event }) => {
  const { plansHall } = useEventsWorkbench();
  const checks = hallChecksOf(event);

  if (checks.skipped) {
    return <KkCheckLine label={SKIPPED_LABEL} value={SKIPPED_VALUE} state="off" icon="tables" />;
  }

  const note = plansHall ? null : <KkNote>{NO_HALL_PLANNER_NOTE}</KkNote>;

  return (
    <Stack sx={{ rowGap: 1.5 }}>
      <Stack>
        <KkCheckLine
          label={PLAN_CHECK_LABEL}
          value={toPlanValue(checks)}
          state={checks.planState}
          icon="tables"
        />
        <KkCheckLine
          label={TABLES_CHECK_LABEL}
          value={toTablesValue(checks)}
          state={checks.tablesState}
          icon="row"
        />
        <KkCheckLine
          label={CHAIRS_CHECK_LABEL}
          value={toChairsValue(checks)}
          state={checks.tablesState}
          icon="chair"
        />
      </Stack>
      {note}
    </Stack>
  );
};
