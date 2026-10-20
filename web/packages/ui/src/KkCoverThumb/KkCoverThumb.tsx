import type { FC } from 'react';
import type { KkImageSource } from '../image-source';
import type { KkGroupTone } from '../internal/group-tone';
import { KkPhoto } from '../KkPhoto';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';

export type KkCoverThumbShape = 'square' | 'wide' | 'adaptive';
export type KkCoverThumbSize = 'small' | 'medium' | 'large';

type Responsive = { xs: string; sm?: string };

const RATIOS: Record<KkCoverThumbShape, Responsive> = {
  square: { xs: '1 / 1' },
  wide: { xs: '2 / 1' },
  adaptive: { xs: '1 / 1', sm: '2 / 1' },
};

const WIDTHS: Record<KkCoverThumbShape, Record<KkCoverThumbSize, Responsive>> = {
  square: { small: { xs: '2.25rem' }, medium: { xs: '3.5rem' }, large: { xs: '4.5rem' } },
  wide: { small: { xs: '2.75rem' }, medium: { xs: '4.5rem' }, large: { xs: '10rem' } },
  adaptive: {
    small: { xs: '2.25rem', sm: '2.75rem' },
    medium: { xs: '3.5rem', sm: '4.5rem' },
    large: { xs: '4.5rem', sm: '10rem' },
  },
};

const RADII: Record<KkCoverThumbSize, number> = {
  small: kkTokens.radius.bar * 2,
  medium: kkTokens.radius.bar * 3,
  large: kkTokens.radius.base,
};

interface KkCoverThumbProps {
  image: KkImageSource | null;
  tone: KkGroupTone;
  alt: string;
  shape?: KkCoverThumbShape;
  size?: KkCoverThumbSize;
  dimmed?: boolean;
  sx?: KkSx;
}

export const KkCoverThumb: FC<KkCoverThumbProps> = ({
  image,
  tone,
  alt,
  shape = 'square',
  size = 'medium',
  dimmed = false,
  sx,
}) => (
  <KkPhoto
    alt={alt}
    image={image}
    tone={tone}
    dimmed={dimmed}
    sx={[
      {
        flexShrink: 0,
        width: WIDTHS[shape][size],
        aspectRatio: RATIOS[shape],
        borderRadius: `${RADII[size]}px`,
        outlineWidth: kkTokens.line.hair,
        outlineStyle: 'solid',
        outlineColor: 'divider',
        outlineOffset: -kkTokens.line.hair,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  />
);
