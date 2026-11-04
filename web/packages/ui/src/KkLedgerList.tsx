import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { KK_LEDGER_AMOUNT_WIDTH, KK_LEDGER_DAY_WIDTH, KK_LEDGER_RAIL_WIDTH } from './KkLedgerRow';
import { stepLabel } from './KkStatePill/state-paint';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

export interface KkLedgerColumnLabels {
  day: string;
  entry: string;
  amount: string;
  balance: string;
}

interface KkLedgerListProps extends PropsWithChildren {
  label: string;
  columns: KkLedgerColumnLabels;
  sx?: KkSx;
}

const caption = stepLabel;

export const KkLedgerList: FC<KkLedgerListProps> = ({ label, columns, sx, children }) => (
  <Stack data-kk-ledger-list sx={[{ minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}>
    <Stack
      direction="row"
      aria-hidden
      sx={{
        alignItems: 'flex-end',
        gap: 1,
        pr: 0.5,
        pb: 0.5,
        borderBottomWidth: kkTokens.line.section,
        borderBottomStyle: 'solid',
        borderBottomColor: 'text.primary',
      }}
    >
      <Box component="span" sx={{ width: KK_LEDGER_RAIL_WIDTH, flexShrink: 0 }} />
      <Box component="span" sx={{ ...caption, width: KK_LEDGER_DAY_WIDTH, flexShrink: 0 }}>
        {columns.day}
      </Box>
      <Box component="span" sx={{ ...caption, flex: 1, minWidth: 0 }}>
        {columns.entry}
      </Box>
      <Box
        component="span"
        sx={{ ...caption, width: KK_LEDGER_AMOUNT_WIDTH, flexShrink: 0, textAlign: 'right' }}
      >
        {columns.amount}
      </Box>
      <Box
        component="span"
        sx={{ ...caption, width: KK_LEDGER_AMOUNT_WIDTH, flexShrink: 0, textAlign: 'right' }}
      >
        {columns.balance}
      </Box>
    </Stack>
    <Box component="ul" aria-label={label} sx={{ m: 0, p: 0, listStyle: 'none', minWidth: 0 }}>
      {children}
    </Box>
  </Stack>
);
