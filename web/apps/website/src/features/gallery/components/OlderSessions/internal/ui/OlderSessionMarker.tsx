import { kkTokens } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';

interface OlderSessionMarkerProps {
  expanded: boolean;
}

export const OlderSessionMarker: FC<OlderSessionMarkerProps> = ({ expanded }) => (
  <Box
    component="span"
    data-kk-older-session-marker
    aria-hidden
    sx={{
      flexShrink: 0,
      width: '1.5rem',
      textAlign: 'center',
      fontFamily: kkTokens.font.display,
      fontSize: '1.5rem',
      lineHeight: 1,
      color: 'primary.main',
    }}
  >
    {expanded ? '–' : '+'}
  </Box>
);
