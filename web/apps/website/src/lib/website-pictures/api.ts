import type { PublicWebsitePicture } from '@furria/api-client';
import { PublicWebsitePicturesSchema } from '@/lib/api/schemas';
import { definePublicResource } from '@/lib/public-resource/define-public-resource';

export const publicWebsitePictures = definePublicResource({
  path: '/api/public/website-pictures',
  schema: PublicWebsitePicturesSchema,
  key: 'public-website-pictures',
  select: (response): PublicWebsitePicture[] => response.pictures,
});
