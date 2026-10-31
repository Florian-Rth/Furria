import { toViewImageSource } from '@furria/ui/image-source';
import type { KkViewerItem } from '@furria/ui/viewer-types';
import type { AlbumPhotoEntry } from '@/features/gallery/gallery-content';
import { viewerPhotoSizes } from '@/features/gallery/gallery-content';

export const toViewerItem = ({ photo, alt }: AlbumPhotoEntry): KkViewerItem => ({
  key: String(photo.mediaItemId),
  alt,
  image: toViewImageSource(photo, photo.aspect, viewerPhotoSizes),
  size: { width: photo.width, height: photo.height },
  caption: photo.caption ?? undefined,
});
