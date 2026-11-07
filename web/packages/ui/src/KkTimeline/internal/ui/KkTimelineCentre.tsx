import Box from '@mui/material/Box';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

const HEAD = '0.5rem';

export const KkTimelineCentre: FC = () => (
  <Box
    aria-hidden
    data-kk-timeline-centre
    sx={{
      position: 'absolute',
      left: '50%',
      top: 0,
      bottom: 0,
      width: 0,
      pointerEvents: 'none',
      zIndex: 3,
    }}
  >
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: `calc(${HEAD} / -2)`,
        width: HEAD,
        height: HEAD,
        bgcolor: 'text.primary',
        clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
      }}
    />
    <Box
      sx={(theme) => ({
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: -kkTokens.line.section / 2,
        width: kkTokens.line.section,
        bgcolor: 'text.primary',
        boxShadow: `0 0 0 ${kkTokens.line.hair / 2}px ${(theme.vars ?? theme).palette.background.paper}`,
      })}
    />
  </Box>
);
