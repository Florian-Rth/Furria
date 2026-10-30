import { KkMeta } from '@furria/ui/KkMeta';
import { KkStatePill } from '@furria/ui/KkStatePill';
import type { KkStepState } from '@furria/ui/step-state';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';

interface SeasonCLegendItemProps {
  state: KkStepState;
  text: string;
}

export const SeasonCLegendItem: FC<SeasonCLegendItemProps> = ({ state, text }) => (
  <Stack component="li" direction="row" sx={{ alignItems: 'center', gap: 0.75 }}>
    <KkStatePill state={state} label="" sx={{ ml: 0 }} />
    <KkMeta>{text}</KkMeta>
  </Stack>
);
