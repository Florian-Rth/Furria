import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import type { KkImageSource } from '../image-source';
import { KkPhoto } from '../KkPhoto';
import { kkTokens } from '../tokens';

const STRUCK_FILTER = 'grayscale(1)';
const THUMB_SIZES = '4rem';

interface KkPressRowThumbProps {
  picture: KkImageSource | null;
  struck: boolean;
}

export const KkPressRowThumb: FC<KkPressRowThumbProps> = ({ picture, struck }) => {
  const image = picture === null ? null : { ...picture, sizes: picture.sizes ?? THUMB_SIZES };

  return (
    <Box
      aria-hidden
      data-kk-press-row-thumb
      sx={(theme: Theme) => ({
        display: 'grid',
        width: theme.spacing(8),
        flexShrink: 0,
        aspectRatio: kkTokens.aspectRatio.banner,
        borderRadius: 1,
        outline: `${kkTokens.line.hair}px solid`,
        outlineColor: (theme.vars ?? theme).palette.divider,
        outlineOffset: -kkTokens.line.hair,
        filter: struck ? STRUCK_FILTER : 'none',
        opacity: struck ? kkTokens.opacity.dimmed : 1,
      })}
    >
      <KkPhoto alt="" image={image} fill />
    </Box>
  );
};
