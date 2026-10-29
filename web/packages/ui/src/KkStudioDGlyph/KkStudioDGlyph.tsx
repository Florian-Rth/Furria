import Box from '@mui/material/Box';
import type { FC, ReactElement } from 'react';
import type { KkSx } from '../kk-sx';

export type KkStudioDGlyphName = 'play' | 'pause' | 'loop' | 'mirror' | 'close' | 'steps';

const strokeGlyph = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const GLYPHS: Record<KkStudioDGlyphName, ReactElement> = {
  play: (
    <path
      d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"
      fill="currentColor"
    />
  ),
  pause: (
    <g fill="currentColor">
      <rect x="6.5" y="5" width="4" height="14" rx="1.2" />
      <rect x="13.5" y="5" width="4" height="14" rx="1.2" />
    </g>
  ),
  loop: (
    <g {...strokeGlyph}>
      <path d="M4 11.5V10a4 4 0 0 1 4-4h11" />
      <path d="M16 3l3 3-3 3" />
      <path d="M20 12.5V14a4 4 0 0 1-4 4H5" />
      <path d="M8 21l-3-3 3-3" />
    </g>
  ),
  mirror: (
    <g {...strokeGlyph}>
      <path d="M12 3v18" strokeDasharray="2 3" />
      <path d="M9 7 3.5 12 9 17z" />
      <path d="M15 7l5.5 5-5.5 5z" fill="currentColor" />
    </g>
  ),
  close: (
    <g {...strokeGlyph}>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </g>
  ),
  steps: (
    <g {...strokeGlyph}>
      <path d="M7 15l5-5 5 5" />
    </g>
  ),
};

interface KkStudioDGlyphProps {
  name: KkStudioDGlyphName;
  size?: string;
  sx?: KkSx;
}

export const KkStudioDGlyph: FC<KkStudioDGlyphProps> = ({ name, size = '1.25rem', sx }) => (
  <Box
    component="svg"
    viewBox="0 0 24 24"
    aria-hidden
    data-kk-studio-d-glyph={name}
    sx={[
      { width: size, height: size, flexShrink: 0, display: 'block' },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {GLYPHS[name]}
  </Box>
);
