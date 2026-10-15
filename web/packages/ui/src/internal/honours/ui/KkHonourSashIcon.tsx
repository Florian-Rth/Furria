import type { FC } from 'react';
import { KkClubIconGlyph } from '../../../KkClubIconGlyph';
import type { KkClubIcon } from '../../club-icon';
import { sashInkPaint } from '../honour-paint';
import type { SashIcon } from '../honour-sash';

const GLYPH_GRID = '0 0 24 24';

interface KkHonourSashIconProps {
  icon: KkClubIcon;
  place: SashIcon;
}

export const KkHonourSashIcon: FC<KkHonourSashIconProps> = ({ icon, place }) => (
  <svg
    aria-hidden="true"
    x={place.x}
    y={place.y}
    width={place.size}
    height={place.size}
    viewBox={GLYPH_GRID}
  >
    <KkClubIconGlyph icon={icon} sx={sashInkPaint} />
  </svg>
);
