import SvgIcon from '@mui/material/SvgIcon';
import type { FC } from 'react';
import type { KkSx } from './kk-sx';

export type KkEntryKindGlyphKind = 'plain' | 'training' | 'trip' | 'event';

export type KkEntryKindGlyphSize = 'tiny' | 'small' | 'medium';

const EXTENTS: Record<KkEntryKindGlyphSize, string> = {
  tiny: '0.875rem',
  small: '1.125rem',
  medium: '1.375rem',
};
const STROKE = 1.9;

const STROKES: Record<KkEntryKindGlyphKind, readonly string[]> = {
  plain: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M8 12h.01', 'M12 12h.01', 'M16 12h.01'],
  training: [
    'M12 21a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15z',
    'M12 13.5V10',
    'M10 2.75h4',
    'M12 2.75V6',
    'M18.5 6.5l1.25-1.25',
  ],
  trip: [
    'M5.5 4.5h13A1.5 1.5 0 0 1 20 6v10.5H4V6a1.5 1.5 0 0 1 1.5-1.5z',
    'M4 11h16',
    'M7.5 16.5V19',
    'M16.5 16.5V19',
    'M7.5 14h.01',
    'M16.5 14h.01',
  ],
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
