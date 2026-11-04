import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { raisedSurface } from '../../../../internal/raised-surface';
import type { KkSx } from '../../../../kk-sx';
import { kkTokens } from '../../../../tokens';

const rootPaint = (theme: Theme): CSSObject => ({
  flexDirection: 'column',
  [theme.breakpoints.up('md')]: { flexDirection: 'row' },
  minWidth: 0,
  borderRadius: `${kkTokens.radius.base}px`,
  borderWidth: kkTokens.line.hair,
  borderStyle: 'solid',
  borderColor: 'divider',
  ...raisedSurface(theme),
  '& > * + *': {
    borderTopWidth: kkTokens.line.hair,
    borderTopStyle: 'solid',
    borderColor: 'divider',
    [theme.breakpoints.up('md')]: {
      borderTopWidth: 0,
      borderLeftWidth: kkTokens.line.hair,
      borderLeftStyle: 'solid',
    },
  },
});

interface KkPourHeadRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkPourHeadRoot: FC<KkPourHeadRootProps> = ({ label, children, sx }) => (
  <Stack
    component="section"
    aria-label={label}
    data-kk-pour-head
    sx={[rootPaint, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Stack>
);
