import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

interface KkHealthStripRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkHealthStripRoot: FC<KkHealthStripRootProps> = ({ label, sx, children }) => (
  <Stack
    component="section"
    aria-label={label}
    direction={{ xs: 'column', md: 'row' }}
    data-kk-health-strip
    sx={[
      {
        alignItems: { xs: 'stretch', md: 'center' },
        minWidth: 0,
        bgcolor: 'background.paper',
        borderWidth: kkTokens.line.hair,
        borderStyle: 'solid',
        borderColor: 'divider',
        borderRadius: `${kkTokens.radius.base}px`,
        '& > [data-kk-health-strip-filters]': {
          borderWidth: 0,
          borderTopWidth: { xs: kkTokens.line.hair, md: 0 },
          borderLeftWidth: { xs: 0, md: kkTokens.line.hair },
          borderStyle: 'solid',
          borderColor: 'divider',
        },
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
