import Box from '@mui/material/Box';
import type { CSSObject } from '@mui/material/styles';
import type { FC } from 'react';
import type { KkSx } from '../kk-sx';
import type { KkEntryKindGlyphKind } from './entry-kind-glyphs';
import { ENTRY_GLYPH_VIEW_BOX, entryGlyphStrokes } from './entry-kind-glyphs';

export type KkEntryKindGlyphSize = 'mark' | 'small' | 'medium';

const GLYPH_STROKE = 1.6;

const GLYPH_EXTENTS: Record<KkEntryKindGlyphSize, string> = {
  mark: '0.875rem',
  small: '1.125rem',
  medium: '1.25rem',
};

const glyphPaintOf = (size: KkEntryKindGlyphSize): CSSObject => ({
  display: 'block',
  flexShrink: 0,
  width: GLYPH_EXTENTS[size],
  height: GLYPH_EXTENTS[size],
  overflow: 'visible',
});

interface KkEntryKindGlyphProps {
  kind: KkEntryKindGlyphKind;
  size?: KkEntryKindGlyphSize;
  sx?: KkSx;
}

export const KkEntryKindGlyph: FC<KkEntryKindGlyphProps> = ({ kind, size = 'medium', sx }) => (
  <Box
    component="svg"
    viewBox={ENTRY_GLYPH_VIEW_BOX}
    aria-hidden
    focusable="false"
    fill="none"
    stroke="currentColor"
    strokeWidth={GLYPH_STROKE}
    strokeLinecap="round"
    strokeLinejoin="round"
    data-kk-entry-glyph={kind}
    sx={[glyphPaintOf(size), ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {entryGlyphStrokes[kind]}
  </Box>
);
