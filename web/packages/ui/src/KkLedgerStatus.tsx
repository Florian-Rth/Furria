import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { KkStateGlyph } from './KkStatePill/KkStateGlyph';
import { stepFigures, stepStateInk } from './KkStatePill/state-paint';
import type { KkStepState } from './KkStatePill/step-state';
import type { KkSx } from './kk-sx';

interface KkLedgerStatusProps {
  state: KkStepState;
  text: string;
  sx?: KkSx;
}

export const KkLedgerStatus: FC<KkLedgerStatusProps> = ({ state, text, sx }) => (
  <Stack
    direction="row"
    data-kk-ledger-status={state}
    sx={[{ alignItems: 'center', gap: 0.75, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    <KkStateGlyph state={state} />
    <Box
      component="span"
      sx={[
        {
          ...stepFigures,
          typography: 'caption',
          fontWeight: 800,
          minWidth: 0,
        },
        (theme) => (state === 'open' ? { color: 'text.primary' } : stepStateInk(theme, state)),
      ]}
    >
      {text}
    </Box>
  </Stack>
);
