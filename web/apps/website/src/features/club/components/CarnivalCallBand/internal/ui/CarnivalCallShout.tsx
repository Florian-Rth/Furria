import Box from '@mui/material/Box';
import type { FC } from 'react';
import { carnivalCallBandContent } from '@/features/club/carnival-call-content';

export const CarnivalCallShout: FC = () => (
  <Box
    data-kk-carnival-call-shout
    sx={{
      position: 'relative',
      zIndex: 1,
      typography: 'display',
      lineHeight: 0.86,
      letterSpacing: '0.01em',
      textAlign: { xs: 'left', md: 'right' },
    }}
  >
    <Box component="span" sx={{ display: 'block' }}>
      {carnivalCallBandContent.shoutLead}
    </Box>
    <Box
      component="span"
      sx={(theme) => ({
        display: 'block',
        color: 'transparent',
        WebkitTextStroke: `2px ${(theme.vars ?? theme).palette.primary.contrastText}`,
      })}
    >
      {carnivalCallBandContent.shoutCall}
    </Box>
  </Box>
);
