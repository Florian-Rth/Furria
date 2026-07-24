import { kkTokens } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import { narrenrufBandContent } from '@/features/club/narrenruf-content';

export const NarrenrufShout: FC = () => (
  <Box
    data-kk-narrenruf-shout
    sx={{
      position: 'relative',
      zIndex: 1,
      fontFamily: kkTokens.font.display,
      fontSize: { xs: '4.5rem', sm: '6rem', md: '8rem' },
      lineHeight: 0.86,
      letterSpacing: '0.01em',
      textAlign: { xs: 'left', md: 'right' },
    }}
  >
    <Box component="span" sx={{ display: 'block' }}>
      {narrenrufBandContent.shoutLead}
    </Box>
    <Box
      component="span"
      sx={(theme) => ({
        display: 'block',
        color: 'transparent',
        WebkitTextStroke: `2px ${(theme.vars ?? theme).palette.primary.contrastText}`,
      })}
    >
      {narrenrufBandContent.shoutCall}
    </Box>
  </Box>
);
