import { KkStatePill } from '@furria/ui/KkStatePill';
import type { KkStepState } from '@furria/ui/step-state';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { STATE_LABELS } from '../event-board-copy';

const SAMPLE_STATES: readonly KkStepState[] = ['done', 'current', 'overdue', 'open', 'waiting'];

export const EventsHelpStatesPreview: FC = () => {
  const pills = SAMPLE_STATES.map((state) => (
    <KkStatePill key={state} state={state} label={STATE_LABELS[state]} sx={{ ml: 0 }} />
  ));

  return (
    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, minWidth: 0 }}>
      {pills}
    </Stack>
  );
};
