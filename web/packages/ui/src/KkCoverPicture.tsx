import type { FC } from 'react';
import type { KkImageSource } from './image-source';
import type { KkSx } from './kk-sx';
import { KkImage } from './KkImage';

interface KkCoverPictureProps {
  image: KkImageSource;
  alt: string;
  priority?: boolean;
  sx?: KkSx;
}

export const KkCoverPicture: FC<KkCoverPictureProps> = ({ image, alt, priority = false, sx }) => {
  const loading = priority ? 'eager' : 'lazy';
  const fetchPriority = priority ? 'high' : 'auto';

  return (
    <KkImage
      src={image.src}
      srcSet={image.srcSet}
      sizes={image.sizes}
      alt={alt}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding="async"
      sx={[
        { display: 'block', width: '100%', height: '100%', objectFit: 'cover' },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  );
};
