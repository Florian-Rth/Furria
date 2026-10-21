import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import type { KkImageSource } from '../../../image-source';
import type { KkGroupTone } from '../../../internal/group-tone';
import { groupToneFieldPaint } from '../../../internal/group-tone';
import type { KkIconName } from '../../../KkIcon';
import { KkIcon } from '../../../KkIcon';
import { KkPhoto } from '../../../KkPhoto';
import type { KkSx } from '../../../kk-sx';
import { TILE_INNER_RADIUS } from '../tile-paint';

export type KkStartTileThumbSize = 'small' | 'medium' | 'large';

const EXTENTS: Record<KkStartTileThumbSize, { xs: string; md: string }> = {
  small: { xs: '2.25rem', md: '2.25rem' },
  medium: { xs: '3.5rem', md: '4rem' },
  large: { xs: '4.5rem', md: '5.5rem' },
};

const ICON_SIZES = { small: 'small', medium: 'medium', large: 'large' } as const;

const frameOf =
  (size: KkStartTileThumbSize) =>
  (theme: Theme): CSSObject => ({
    flexShrink: 0,
    width: EXTENTS[size].xs,
    height: EXTENTS[size].xs,
    borderRadius: TILE_INNER_RADIUS,
    [theme.breakpoints.up('md')]: { width: EXTENTS[size].md, height: EXTENTS[size].md },
  });

const fieldPaint =
  (tone: KkGroupTone, size: KkStartTileThumbSize) =>
  (theme: Theme): CSSObject => ({
    ...frameOf(size)(theme),
    alignItems: 'center',
    justifyContent: 'center',
    ...groupToneFieldPaint(theme, tone),
  });

interface KkStartTileThumbProps {
  image: KkImageSource | null;
  tone: KkGroupTone;
  icon: KkIconName;
  alt: string;
  size?: KkStartTileThumbSize;
  sx?: KkSx;
}

export const KkStartTileThumb: FC<KkStartTileThumbProps> = ({
  image,
  tone,
  icon,
  alt,
  size = 'medium',
  sx,
}) => {
  if (image === null) {
    return (
      <Stack
        aria-hidden
        data-kk-start-tile-thumb
        sx={[fieldPaint(tone, size), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        <KkIcon name={icon} size={ICON_SIZES[size]} />
      </Stack>
    );
  }

  return (
    <KkPhoto
      alt={alt}
      image={image}
      tone={tone}
      size="thumb"
      aspectRatio="1 / 1"
      sx={[frameOf(size), ...(Array.isArray(sx) ? sx : [sx])]}
    />
  );
};
