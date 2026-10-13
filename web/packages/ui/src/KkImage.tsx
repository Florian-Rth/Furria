import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { ImageFault } from './internal/use-image-fault';
import { useImageFault } from './internal/use-image-fault';
import { KkPhotoPlaceholder } from './KkPhotoPlaceholder';
import type { KkSx } from './kk-sx';

type KkImageFault = 'picture' | 'hide';

const FAULT_CENTRE = { display: 'flex' } as const;

interface KkImageProps {
  src: string;
  srcSet?: string;
  sizes?: string;
  alt: string;
  width?: number;
  height?: number;
  loading?: 'eager' | 'lazy';
  decoding?: 'async' | 'auto' | 'sync';
  fetchPriority?: 'high' | 'low' | 'auto';
  draggable?: boolean;
  fault?: KkImageFault;
  faultState?: ImageFault;
  sx?: KkSx;
}

export const KkImage: FC<KkImageProps> = ({
  src,
  srcSet,
  sizes,
  alt,
  width,
  height,
  loading,
  decoding,
  fetchPriority,
  draggable,
  fault = 'picture',
  faultState,
  sx,
}) => {
  const ownFault = useImageFault(src);
  const imageFault = faultState ?? ownFault;
  const sxList = Array.isArray(sx) ? sx : [sx];

  if (imageFault.hasFailed && fault === 'hide') {
    return null;
  }
  if (imageFault.hasFailed) {
    return <KkPhotoPlaceholder fill broken sx={[...sxList, FAULT_CENTRE]} />;
  }

  return (
    <Box
      component="img"
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      decoding={decoding}
      fetchPriority={fetchPriority}
      draggable={draggable}
      onError={imageFault.onError}
      data-kk-image
      sx={sx}
    />
  );
};
