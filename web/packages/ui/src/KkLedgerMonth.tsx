import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { stepFigures, stepLabel } from './KkStatePill/state-paint';
import type { KkSx } from './kk-sx';

interface KkLedgerMonthProps {
  label: string;
  aside: string;
  sx?: KkSx;
}

export const KkLedgerMonth: FC<KkLedgerMonthProps> = ({ label, aside, sx }) => (
  <Stack
    component="li"
    direction="row"
    data-kk-ledger-month
    sx={[
      {
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 1,
        pt: 2,
        pb: 0.5,
        pr: 0.5,
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: 'divider',
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <Box component="span" sx={{ ...stepLabel, color: 'text.primary' }}>
      {label}
    </Box>
    <Box component="span" sx={{ ...stepLabel, ...stepFigures }}>
      {aside}
    </Box>
  </Stack>
);
