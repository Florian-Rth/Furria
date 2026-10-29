import { KkSeverityGlyph } from '@furria/ui/KkSeverityGlyph';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { usePlanner } from '../planner-context';
import { toReadout } from '../planner-copy';

export const PlannerDragReadout: FC = () => {
  const { readout } = usePlanner().drag;

  if (readout === null) {
    return null;
  }

  const severity = readout.conflicts === 0 ? 'met' : 'conflict';

  return (
    <Stack
      direction="row"
      component="span"
      role="status"
      data-kk-drag-readout={severity}
      sx={{ alignItems: 'center', gap: 0.5 }}
    >
      <KkSeverityGlyph state={severity} />
      {toReadout(readout.conflicts)}
    </Stack>
  );
};
