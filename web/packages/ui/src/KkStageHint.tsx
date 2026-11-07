import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkLaneGlyphName } from './KkLaneGlyph';
import { KkLaneGlyph } from './KkLaneGlyph';

interface KkStageHintProps {
  glyph: KkLaneGlyphName;
  text: string;
  wraps?: boolean;
}

export const KkStageHint: FC<KkStageHintProps> = ({ glyph, text, wraps = false }) => (
  <Stack
    direction="row"
    aria-live="polite"
    sx={{
      alignItems: 'center',
      gap: 0.75,
      minWidth: 0,
      minHeight: '1.75rem',
      color: 'text.secondary',
    }}
  >
    <KkLaneGlyph name={glyph} />
    <Typography
      variant="caption"
      noWrap={!wraps}
      sx={{
        fontWeight: 700,
        lineHeight: 1.2,
        minWidth: 0,
      }}
    >
      {text}
    </Typography>
  </Stack>
);
