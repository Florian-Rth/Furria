import { KkCheckLine } from '@furria/ui/KkCheckLine';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { hallChecksOf } from '../hall-step';
import {
  CHAIRS_CHECK_LABEL,
  PLAN_CHECK_LABEL,
  SKIPPED_LABEL,
  SKIPPED_VALUE,
  TABLES_CHECK_LABEL,
  toChairsValue,
  toPlanValue,
  toTablesValue,
} from '../hall-step-copy';
import type { EventDetails } from '../schemas';

interface EventPaneHallProps {
  event: EventDetails;
}

export const EventPaneHall: FC<EventPaneHallProps> = ({ event }) => {
  const checks = hallChecksOf(event);

  if (checks.skipped) {
    return <KkCheckLine label={SKIPPED_LABEL} value={SKIPPED_VALUE} state="off" icon="tables" />;
  }

  const planLine = (
    <KkCheckLine
      label={PLAN_CHECK_LABEL}
      value={toPlanValue(checks)}
      state={checks.planState}
      icon="tables"
    />
  );

  if (checks.tables === null) {
    return planLine;
  }

  return (
    <Stack>
      {planLine}
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
  );
};
