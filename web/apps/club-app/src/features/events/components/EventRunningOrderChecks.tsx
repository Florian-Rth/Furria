import { KkCheckLine } from '@furria/ui/KkCheckLine';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { RunningOrderChecks } from '../running-order-step';
import {
  CONFLICTS_LABEL,
  PLACED_LABEL,
  STANDING_LABEL,
  toConflictsValue,
  toPlacedValue,
  toStandingValue,
} from '../running-order-step-copy';

interface EventRunningOrderChecksProps {
  checks: RunningOrderChecks;
}

export const EventRunningOrderChecks: FC<EventRunningOrderChecksProps> = ({ checks }) => {
  const placed = toPlacedValue(checks);
  const conflicts = toConflictsValue(checks);
  const standing = toStandingValue(checks);

  return (
    <Stack>
      <KkCheckLine label={PLACED_LABEL} value={placed} state={checks.placedState} icon="stage" />
      <KkCheckLine
        label={CONFLICTS_LABEL}
        value={conflicts}
        state={checks.conflictsState}
        severity={checks.conflictsSeverity}
        icon="alert"
      />
      <KkCheckLine
        label={STANDING_LABEL}
        value={standing}
        state={checks.standingState}
        icon="check"
      />
    </Stack>
  );
};
