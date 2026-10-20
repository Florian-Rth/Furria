import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

interface KkFactStripRootProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkFactStripRoot: FC<KkFactStripRootProps> = ({ label, sx, children }) => (
  <Box
    component="dl"
    aria-label={label}
    data-kk-fact-strip
    sx={[
      {
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, minmax(0, 1fr))',
          sm: 'repeat(4, minmax(0, 1fr))',
          lg: 'repeat(auto-fit, minmax(8.5rem, 1fr))',
        },
        gap: `${kkTokens.line.hair}px`,
        m: 0,
        minWidth: 0,
        bgcolor: 'divider',
        borderWidth: kkTokens.line.hair,
        borderStyle: 'solid',
        borderColor: 'divider',
        borderRadius: `${kkTokens.radius.base}px`,
        overflow: 'hidden',
        '& > [data-kk-fact-strip-fact]': { bgcolor: 'background.paper' },
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Box>
);
