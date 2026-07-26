import Card from '@mui/material/Card';
import type { SxProps, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

interface KkCardRootProps extends PropsWithChildren {
  sx?: SxProps<Theme>;
}

export const KkCardRoot: FC<KkCardRootProps> = ({ sx, children }) => (
  <Card
    data-kk-card
    sx={[
      (theme) => ({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: theme.transitions.create(['transform', 'box-shadow'], {
          duration: theme.transitions.duration.shortest,
        }),
        '&:has(.MuiCardActionArea-root:hover)': {
          transform: 'translateY(-2px)',
          boxShadow: kkTokens.shadow.raised,
          '& [data-kk-card-title]': { color: 'primary.main' },
        },
        '&:has(.Mui-focusVisible)': {
          outlineWidth: 2,
          outlineStyle: 'solid',
          outlineColor: (theme.vars ?? theme).palette.primary.main,
          outlineOffset: 2,
        },
        '& .MuiCardActionArea-root': {
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        },
      }),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Card>
);
