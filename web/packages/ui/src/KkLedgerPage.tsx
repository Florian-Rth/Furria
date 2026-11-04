import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren, ReactNode } from 'react';
import { safeArea } from './internal/safe-area';

const PAGE_WIDTH = '26rem';
const PAGE_EDGE = 16;
const PAGE_FOOT = 24;

interface KkLedgerPageProps extends PropsWithChildren {
  label: string;
  after?: ReactNode;
}

export const KkLedgerPage: FC<KkLedgerPageProps> = ({ label, after, children }) => (
  <Stack
    component="main"
    aria-label={label}
    data-kk-ledger-page
    sx={{ mx: 'auto', width: '100%', maxWidth: PAGE_WIDTH, px: 2 }}
  >
    <Stack
      sx={{
        minHeight: '100dvh',
        gap: 3,
        pt: safeArea('top', PAGE_EDGE),
        pb: safeArea('bottom', PAGE_FOOT),
      }}
    >
      {children}
    </Stack>
    {after}
  </Stack>
);
