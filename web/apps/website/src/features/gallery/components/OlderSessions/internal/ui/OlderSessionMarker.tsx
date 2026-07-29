import { kkTokens } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';

interface OlderSessionMarkerProps {
  expanded: boolean;
}

const EXPANDED_GLYPH = '–';
const COLLAPSED_GLYPH = '+';

export const OlderSessionMarker: FC<OlderSessionMarkerProps> = ({ expanded }) => {
  const glyph = expanded ? EXPANDED_GLYPH : COLLAPSED_GLYPH;

  return (
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
      {glyph}
    </Box>
  );
};
