import type { ReactNode } from 'react';

export const KK_ENTRY_KIND_GLYPHS = ['plain', 'training', 'trip', 'event'] as const;

export type KkEntryKindGlyphKind = (typeof KK_ENTRY_KIND_GLYPHS)[number];

export const ENTRY_GLYPH_VIEW_BOX = '0 0 16 16';

export const entryGlyphStrokes: Record<KkEntryKindGlyphKind, ReactNode> = {
  plain: <path d="M8 2.4 13.6 8 8 13.6 2.4 8z" />,
  training: (
    <>
      <circle cx="8" cy="9.25" r="4.75" />
      <path d="M8 9.25V6.6M6.4 2.25h3.2M8 2.25v2.25M12.1 4.6l.9-.9" />
    </>
  ),
  trip: (
    <>
      <path d="M3.9 2.6h8.2a1 1 0 0 1 1 1v7.4H2.9V3.6a1 1 0 0 1 1-1z" />
      <path d="M2.9 7.3h10.2M5 11v2.2M11 11v2.2M5.2 9.2h.01M10.8 9.2h.01" />
    </>
  ),
  event: (
    <>
      <path d="M2.2 4.4h11.6v2.3a1.4 1.4 0 0 0 0 2.6v2.3H2.2V9.3a1.4 1.4 0 0 0 0-2.6z" />
      <path d="M9.6 5v6" strokeDasharray="1.1 1.3" />
    </>
  ),
};
