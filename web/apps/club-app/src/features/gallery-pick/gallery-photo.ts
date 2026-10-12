import type { KkSize } from '@furria/ui';
import type { GalleryPhoto, PickableAlbums } from './schemas';
import type { PickableAlbum } from './types';

export const photoSizeOf = ({ width, height }: GalleryPhoto): KkSize | null =>
  width === null || height === null ? null : { width, height };

export const isPickablePhoto = (item: GalleryPhoto): boolean =>
  item.kind === 'photo' && item.state === 'ready';

export const pickableAlbumsOf = ({ sections }: PickableAlbums): PickableAlbum[] =>
  sections
    .flatMap((section) => section.albums)
    .filter((album) => album.photos > 0)
    .map(({ albumId, title }) => ({ albumId, title }));
