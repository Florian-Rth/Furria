import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { trackEdgeOf } from '../../../KkShell/internal/track-edge';
import { kkTokens } from '../../../tokens';

const WIDE = '@container kk-practice (min-aspect-ratio: 5/4)';

export const KkPracticeViewHero: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-practice-hero
    sx={{
      gridArea: 'hero',
      display: 'grid',
      placeItems: 'center',
      minWidth: 0,
      minHeight: 0,
      containerType: 'size',
      ml: `calc(-1 * ${trackEdgeOf('left')})`,
      mr: `calc(-1 * ${trackEdgeOf('right')})`,
      '& > [data-kk-practice-screen]': { borderRadius: 0 },
      [WIDE]: {
        ml: 0,
        mr: 0,
        '& > [data-kk-practice-screen]': { borderRadius: `${kkTokens.radius.base}px` },
      },
    }}
  >
    {children}
  </Box>
);
