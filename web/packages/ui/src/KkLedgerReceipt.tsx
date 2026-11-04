import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';
import { stepFigures } from './KkStatePill/state-paint';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

export interface KkLedgerReceiptLine {
  key: string;
  label: string;
  value: ReactNode;
  total?: boolean;
}

interface KkLedgerReceiptProps {
  label: string;
  lines: readonly KkLedgerReceiptLine[];
  sx?: KkSx;
}

export const KkLedgerReceipt: FC<KkLedgerReceiptProps> = ({ label, lines, sx }) => {
  const rows = lines.map((line) => {
    const total = line.total ?? false;

    return (
      <Stack
        key={line.key}
        component="li"
        direction="row"
        sx={{
          alignItems: 'baseline',
          gap: 1,
          minWidth: 0,
          pt: total ? 1 : 0.5,
          mt: total ? 0.5 : 0,
          borderTopWidth: total ? kkTokens.line.section : 0,
          borderTopStyle: 'solid',
          borderTopColor: 'text.primary',
        }}
      >
        <Box
          component="span"
          sx={{
            typography: total ? 'body2' : 'caption',
            fontWeight: total ? 900 : 700,
            color: total ? 'text.primary' : 'text.secondary',
            whiteSpace: 'nowrap',
          }}
        >
          {line.label}
        </Box>
        <Box
          component="span"
          aria-hidden
          sx={{
            flex: 1,
            minWidth: '1rem',
            borderBottomWidth: kkTokens.line.section,
            borderBottomStyle: 'dotted',
            borderBottomColor: 'divider',
          }}
        />
        <Box
          component="span"
          sx={{
            ...stepFigures,
            typography: total ? 'h3' : 'body2',
            fontWeight: total ? undefined : 800,
            whiteSpace: 'nowrap',
          }}
        >
          {line.value}
        </Box>
      </Stack>
    );
  });

  return (
    <Box
      component="ul"
      aria-label={label}
      data-kk-ledger-receipt
      sx={[{ m: 0, p: 0, listStyle: 'none', minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {rows}
    </Box>
  );
};
