import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { raisedSurface } from './internal/raised-surface';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

interface KkLedgerFootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkLedgerFoot: FC<KkLedgerFootProps> = ({ label, sx, children }) => (
  <Stack
    component="section"
    aria-label={label}
    data-kk-ledger-foot
    sx={[
      (theme) => ({
        position: 'relative',
        gap: 1,
        minWidth: 0,
        px: 1.25,
        py: 1,
        borderRadius: `${kkTokens.radius.base}px`,
        borderWidth: kkTokens.line.hair,
        borderStyle: 'solid',
        borderColor: (theme.vars ?? theme).palette.divider,
        boxShadow: kkTokens.shadow.raised,
        ...raisedSurface(theme),
      }),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
