import SvgIcon from '@mui/material/SvgIcon';
import type { FC } from 'react';
import type { KkSx } from './kk-sx';

export type KkEntryKindGlyphKind =
  | 'training'
  | 'rehearsal'
  | 'performance'
  | 'meeting'
  | 'party'
  | 'other'
  | 'event';

export type KkEntryKindGlyphSize = 'tiny' | 'small' | 'medium';

const EXTENTS: Record<KkEntryKindGlyphSize, string> = {
  tiny: '0.875rem',
  small: '1.125rem',
  medium: '1.375rem',
};
const STROKE = 1.9;

const STROKES: Record<KkEntryKindGlyphKind, readonly string[]> = {
  training: [
    'M12 21a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15z',
    'M12 13.5V10',
    'M10 2.75h4',
    'M12 2.75V6',
    'M18.5 6.5l1.25-1.25',
  ],
  rehearsal: [
    'M4.5 11a7.5 7.5 0 0 1 13-4.6l2 2.1',
    'M19.5 4v4.5H15',
    'M19.5 13a7.5 7.5 0 0 1-13 4.6l-2-2.1',
    'M4.5 20v-4.5H9',
  ],
  performance: [
    'M12 3.25l2.6 5.35 5.9.85-4.25 4.15 1 5.85L12 16.7l-5.25 2.75 1-5.85L3.5 9.45l5.9-.85z',
  ],
  meeting: [
    'M8 4.5H6.5A1.5 1.5 0 0 0 5 6v13.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H16',
    'M9 3h6v3H9z',
    'M8.5 11h7',
    'M8.5 15h5',
  ],
  party: [
    'M4 20l3.5-10.5 7 7z',
    'M13 3.5c.5 1.5-.5 2.5 0 4',
    'M16.5 7.5l2-2',
    'M17 12c1.5-.5 2.5.5 4 0',
    'M19.5 3.5h.01',
    'M21 8.5h.01',
  ],
  other: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M8 12h.01', 'M12 12h.01', 'M16 12h.01'],
  event: [
    'M3.5 7.5A1.5 1.5 0 0 1 5 6h14a1.5 1.5 0 0 1 1.5 1.5V10a2 2 0 0 0 0 4v2.5A1.5 1.5 0 0 1 19 18H5a1.5 1.5 0 0 1-1.5-1.5V14a2 2 0 0 0 0-4z',
    'M14.5 6.5V8',
    'M14.5 11v2',
    'M14.5 16v1.5',
  ],
};

interface KkEntryKindGlyphProps {
  kind: KkEntryKindGlyphKind;
  size?: KkEntryKindGlyphSize;
  sx?: KkSx;
}

export const KkEntryKindGlyph: FC<KkEntryKindGlyphProps> = ({ kind, size = 'medium', sx }) => {
  const extent = EXTENTS[size];
  const paths = STROKES[kind].map((d) => <path key={d} d={d} />);

  return (
    <SvgIcon
      viewBox="0 0 24 24"
      aria-hidden
      data-kk-calendar-glyph={kind}
      sx={[
        {
          width: extent,
          height: extent,
          flexShrink: 0,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: STROKE,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {paths}
    </SvgIcon>
  );
};
