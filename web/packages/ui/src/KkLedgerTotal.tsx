import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';
import { stepFigures, stepLabel } from './KkStatePill/state-paint';
import type { KkSx } from './kk-sx';

interface KkLedgerTotalProps {
  label: string;
  value: ReactNode;
  note?: string;
  sx?: KkSx;
}

export const KkLedgerTotal: FC<KkLedgerTotalProps> = ({ label, value, note, sx }) => {
  const noteLine =
    note === undefined ? null : (
      <Box component="span" sx={{ ...stepFigures, typography: 'caption', color: 'text.secondary' }}>
        {note}
      </Box>
    );

  return (
    <Stack
      data-kk-ledger-total
      sx={[
        { position: 'relative', alignItems: 'center', gap: 0.5, minWidth: 0 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box component="span" sx={stepLabel}>
        {label}
      </Box>
      <Box
        component="span"
        sx={{ ...stepFigures, typography: 'display', lineHeight: 1, whiteSpace: 'nowrap' }}
      >
        {value}
      </Box>
      {noteLine}
    </Stack>
  );
};
