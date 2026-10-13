import type { PublicWebsitePicture } from '@furria/api-client';
import { slotPictureUrlOf } from '@furria/website-pictures';
import type { RouteHead } from '@/lib/seo';

const SHARE_IMAGE_SLOT = 'site.shareImage';
const FIRST_POSITION = 1;

const shareImageAltOf = (pictures: readonly PublicWebsitePicture[]): string | null => {
  const alt = pictures.find(
    (picture) => picture.slot === SHARE_IMAGE_SLOT && picture.position === FIRST_POSITION,
  )?.alt;

  return alt === undefined || alt === null || alt === '' ? null : alt;
};

export const siteShareImageMeta = (
  pictures: readonly PublicWebsitePicture[],
): RouteHead['meta'] => {
  const alt = shareImageAltOf(pictures);
  const image = {
    property: 'og:image',
    content: slotPictureUrlOf(SHARE_IMAGE_SLOT, FIRST_POSITION, 'medium'),
  };

  return alt === null ? [image] : [image, { property: 'og:image:alt', content: alt }];
};
