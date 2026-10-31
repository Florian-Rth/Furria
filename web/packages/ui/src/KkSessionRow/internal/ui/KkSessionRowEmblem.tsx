import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { KkImageSource } from '../../../image-source';
import { inkWashSurface } from '../../../internal/ink-wash';
import { KkImage } from '../../../KkImage';
import { KkPhoto } from '../../../KkPhoto';
import { EMBLEM_SIZES, emblemTile } from './emblem-tile';

const EMBLEM_FILL = { width: '100%', height: '100%', objectFit: 'contain' } as const;

interface KkSessionRowEmblemProps {
  image: KkImageSource | null;
}

export const KkSessionRowEmblem: FC<KkSessionRowEmblemProps> = ({ image }) => {
  const content =
    image === null ? (
      <KkPhoto alt="" fill />
    ) : (
      <KkImage
        src={image.src}
        srcSet={image.srcSet}
        sizes={image.sizes ?? EMBLEM_SIZES}
        alt=""
        loading="lazy"
        decoding="async"
        sx={EMBLEM_FILL}
      />
    );

  return (
    <Stack
      aria-hidden
      data-kk-session-row-emblem
      sx={(theme) => ({ ...emblemTile(theme), ...inkWashSurface(theme, '3%', '5%') })}
    >
      {content}
    </Stack>
  );
};
