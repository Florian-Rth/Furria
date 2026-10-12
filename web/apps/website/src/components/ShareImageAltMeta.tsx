import type { FC } from 'react';
import { useWebsitePicture } from '@/lib/website-pictures/use-website-picture';

const SHARE_IMAGE_SIZES = '1200px';

export const ShareImageAltMeta: FC = () => {
  const shareImage = useWebsitePicture('site.shareImage', SHARE_IMAGE_SIZES);

  if (shareImage.state !== 'filled' || shareImage.alt === '') {
    return null;
  }

  return <meta property="og:image:alt" content={shareImage.alt} />;
};
