import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { redInk } from '../../../internal/red-ink';
import { KK_STUDIO_I_SHORT } from '../../../KkStudioIEditor/studio-i-editor-query';

interface KkStudioIHeadNumberProps {
  text: string;
  label: string;
}

export const KkStudioIHeadNumber: FC<KkStudioIHeadNumberProps> = ({ text, label }) => (
  <Box
    aria-label={label}
    role="img"
    sx={{
      minWidth: { xs: '2.5rem', desktop: '3.5rem' },
      height: { xs: '3rem', desktop: '4.25rem' },
      display: 'grid',
      placeItems: 'center',
      flexShrink: 0,
      [KK_STUDIO_I_SHORT]: { height: '2.25rem', minWidth: '2rem' },
    }}
  >
    <Typography
      aria-hidden
      variant="h1"
      component="span"
      sx={(theme) => ({
        lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
        ...redInk(theme),
      })}
    >
      {text}
    </Typography>
  </Box>
);
