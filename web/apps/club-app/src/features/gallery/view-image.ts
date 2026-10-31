import type { KkImageSource } from '@furria/ui/image-source';
import { toViewImageSource } from '@furria/ui/image-source';
import type { GalleryMedia } from './schemas';

const VIEW_SIZES = '100vw';

type ViewMedia = Pick<GalleryMedia, 'kind' | 'width' | 'height' | 'urls'>;

export const viewSizeOf = (media: ViewMedia): { width: number; height: number } | undefined =>
  media.width === null || media.height === null || media.height <= 0
    ? undefined
    : { width: media.width, height: media.height };

const photoImageOf = (media: ViewMedia): KkImageSource => {
  const { small, medium, large } = media.urls;
  const size = viewSizeOf(media);
  if (medium === null || large === null || size === undefined) {
    return { src: large ?? medium ?? small };
  }
  return toViewImageSource(
    { smallUrl: small, mediumUrl: medium, largeUrl: large },
    size.width / size.height,
    VIEW_SIZES,
  );
};

export const viewImageOf = (media: ViewMedia): KkImageSource =>
  media.kind === 'video' ? { src: media.urls.poster ?? media.urls.small } : photoImageOf(media);
