import type { KkImageSource, KkViewerItem, KkViewerVideo } from '@furria/ui';
import type { AlbumFrame } from './album-frames';
import { loupeAlt } from './album-labels';
import { durationLabel } from './gallery-view';
import type { AlbumItem } from './schemas';
import { viewImageOf, viewSizeOf } from './view-image';

const imageOf = (item: AlbumItem): KkImageSource | null =>
  item.state === 'ready' ? viewImageOf(item) : null;

const videoOf = (item: AlbumItem): KkViewerVideo | undefined =>
  item.kind !== 'video' || item.state !== 'ready' || item.urls.video === null
    ? undefined
    : { src: item.urls.video, duration: durationLabel(item.durationSeconds) ?? '' };

export const albumViewerItemOf = (frame: AlbumFrame, albumTitle: string): KkViewerItem => ({
  key: String(frame.id),
  alt: frame.item.caption ?? loupeAlt(albumTitle, frame.number),
  image: imageOf(frame.item),
  size: viewSizeOf(frame.item),
  caption: frame.item.caption ?? undefined,
  video: videoOf(frame.item),
});
