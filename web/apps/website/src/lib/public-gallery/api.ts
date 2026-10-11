import { definePublicDetailResource } from '@/lib/public-resource/define-public-resource';
import { idSlugAddress } from '@/lib/public-resource/detail-address';
import type { AlbumSummary, GallerySection } from './schemas';
import { AlbumDetailSchema, GalleryResponseSchema } from './schemas';

type AlbumAddress = Pick<AlbumSummary, 'albumId' | 'title'>;

export const publicGallery = definePublicDetailResource({
  path: '/api/public/gallery',
  schema: GalleryResponseSchema,
  key: 'public-gallery',
  select: (response): GallerySection[] => response.sessions,
  detail: {
    schema: AlbumDetailSchema,
    address: idSlugAddress((album: AlbumAddress) => ({ id: album.albumId, title: album.title })),
  },
});
