import type { ReactNode } from 'react';

export const KK_ENTRY_KIND_GLYPHS = [
  'training',
  'rehearsal',
  'performance',
  'meeting',
  'party',
  'event',
  'other',
] as const;

export type KkEntryKindGlyphKind = (typeof KK_ENTRY_KIND_GLYPHS)[number];

export const ENTRY_GLYPH_VIEW_BOX = '0 0 16 16';

export const entryGlyphStrokes: Record<KkEntryKindGlyphKind, ReactNode> = {
  training: (
    <>
      <circle cx="8" cy="9.25" r="4.75" />
      <path d="M8 9.25V6.6M6.4 2.25h3.2M8 2.25v2.25M12.1 4.6l.9-.9" />
    </>
  ),
  rehearsal: (
    <>
      <path d="M2.9 8a5.1 5.1 0 0 1 8.7-3.6" />
      <path d="M11.9 1.9v2.8H9.1" />
      <path d="M13.1 8a5.1 5.1 0 0 1-8.7 3.6" />
      <path d="M4.1 14.1v-2.8h2.8" />
    </>
  ),
  performance: <path d="M8 1.9l1.8 3.9 4.3.4-3.3 2.8 1 4.2L8 11l-3.8 2.2 1-4.2-3.3-2.8 4.3-.4z" />,
  meeting: (
    <>
      <circle cx="5" cy="5.1" r="1.9" />
      <circle cx="11" cy="5.1" r="1.9" />
      <path d="M1.9 13.6v-1.1a3.1 3.1 0 0 1 6.2 0v1.1M7.9 13.6v-1.1a3.1 3.1 0 0 1 6.2 0v1.1" />
    </>
  ),
  party: (
    <>
      <path d="M4.9 2.1h6.2l-.5 3.9a2.6 2.6 0 0 1-5.2 0z" />
      <path d="M8 8.6v5.1M5.4 13.7h5.2" />
    </>
  ),
  event: (
    <>
      <path d="M2.2 4.4h11.6v2.3a1.4 1.4 0 0 0 0 2.6v2.3H2.2V9.3a1.4 1.4 0 0 0 0-2.6z" />
      <path d="M9.6 5v6" strokeDasharray="1.1 1.3" />
    </>
  ),
  other: <path d="M8 2.4 13.6 8 8 13.6 2.4 8z" />,
};
