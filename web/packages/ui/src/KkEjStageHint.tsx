import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkEjGlyphName } from './KkEjGlyph';
import { KkEjGlyph } from './KkEjGlyph';

interface KkEjStageHintProps {
  glyph: KkEjGlyphName;
  text: string;
  wraps?: boolean;
}

export const KkEjStageHint: FC<KkEjStageHintProps> = ({ glyph, text, wraps = false }) => (
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
    <KkEjGlyph name={glyph} />
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
