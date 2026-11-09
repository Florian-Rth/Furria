import Box from '@mui/material/Box';
import GlobalStyles from '@mui/material/GlobalStyles';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { KkQrCode } from './KkQrCode';
import { stepLabel } from './KkStatePill/state-paint';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const PRINT_ATTRIBUTE = 'data-kk-ledger-print';

const printOnlySheet = {
  '@media print': {
    'body *': { visibility: 'hidden' },
    [`[${PRINT_ATTRIBUTE}], [${PRINT_ATTRIBUTE}] *`]: { visibility: 'visible' },
    [`[${PRINT_ATTRIBUTE}]`]: {
      position: 'fixed',
      inset: 0,
      margin: 'auto',
      width: '14cm',
      height: 'fit-content',
      border: 'none',
      color: '#000',
      background: '#fff',
    },
  },
} as const;

interface KkLedgerPrintSheetProps {
  value: string;
  qrLabel: string;
  eyebrow: string;
  title: string;
  sx?: KkSx;
}

export const KkLedgerPrintSheet: FC<KkLedgerPrintSheetProps> = ({
  value,
  qrLabel,
  eyebrow,
  title,
  sx,
}) => {
  return (
    <Stack
      {...{ [PRINT_ATTRIBUTE]: true }}
      sx={[
        {
          alignItems: 'center',
          gap: 1.5,
          p: 2.5,
          textAlign: 'center',
          bgcolor: 'background.paper',
          borderWidth: kkTokens.line.section,
          borderStyle: 'dashed',
          borderColor: 'divider',
          borderRadius: `${kkTokens.radius.base}px`,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <GlobalStyles styles={printOnlySheet} />
      <Box component="span" sx={stepLabel}>
        {eyebrow}
      </Box>
      <Box component="span" sx={{ typography: 'h2' }}>
        {title}
      </Box>
      <KkQrCode value={value} label={qrLabel} sx={{ width: '11rem', maxWidth: '100%' }} />
    </Stack>
  );
};
