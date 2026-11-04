import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../../kk-sx';
import { kkTokens } from '../../../../tokens';

const countersPaint = (theme: Theme): CSSObject => ({
  flex: 1,
  minWidth: 0,
  [theme.breakpoints.up('md')]: { flex: '0 0 auto', minWidth: '24rem' },
  '& > * + *': {
    borderLeftWidth: kkTokens.line.hair,
    borderLeftStyle: 'solid',
    borderColor: 'divider',
  },
});

interface KkPourHeadCountersProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkPourHeadCounters: FC<KkPourHeadCountersProps> = ({ label, children, sx }) => (
  <Stack
    direction="row"
    role="group"
    aria-label={label}
    sx={[countersPaint, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Stack>
);
