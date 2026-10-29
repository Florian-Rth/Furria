import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { trackEdgeOf } from '../../../KkShell/internal/track-edge';
import { kkTokens } from '../../../tokens';

const WIDE = '@container kk-studio-e (min-aspect-ratio: 5/4)';

export const KkStudioEViewHero: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-studio-e-hero
    sx={{
      gridArea: 'hero',
      display: 'grid',
      placeItems: 'center',
      minWidth: 0,
      minHeight: 0,
      containerType: 'size',
      ml: `calc(-1 * ${trackEdgeOf('left')})`,
      mr: `calc(-1 * ${trackEdgeOf('right')})`,
      '& > [data-kk-studio-e-screen]': { borderRadius: 0 },
      [WIDE]: {
        ml: 0,
        mr: 0,
        '& > [data-kk-studio-e-screen]': { borderRadius: `${kkTokens.radius.base}px` },
      },
    }}
  >
    {children}
  </Box>
);
