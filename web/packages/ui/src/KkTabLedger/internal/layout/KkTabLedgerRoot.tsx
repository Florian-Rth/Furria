import Stack from '@mui/material/Stack';
import { AnimatePresence } from 'motion/react';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

interface KkTabLedgerRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkTabLedgerRoot: FC<KkTabLedgerRootProps> = ({ label, sx, children }) => (
  <Stack
    component="ul"
    aria-label={label}
    data-kk-tab-ledger
    sx={[
      {
        m: 0,
        p: 0,
        listStyle: 'none',
        minWidth: 0,
        bgcolor: 'background.paper',
        borderWidth: kkTokens.line.hair,
        borderStyle: 'solid',
        borderColor: 'divider',
        borderRadius: `${kkTokens.radius.base}px`,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <AnimatePresence initial={false}>{children}</AnimatePresence>
  </Stack>
);
