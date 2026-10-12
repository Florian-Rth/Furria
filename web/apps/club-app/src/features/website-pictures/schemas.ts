import { z } from 'zod';
import { PersonRefSchema, PictureEditingSchema } from '@/lib/api/schemas';

export const WebsitePictureSchema = z.object({
  slot: z.string(),
  position: z.number().int(),
  mediaItemId: z.number().int(),
  aspect: z.number(),
  alt: z.string().nullable(),
  picture: PictureEditingSchema,
  updatedAt: z.iso.datetime({ offset: true }),
  updatedBy: PersonRefSchema.nullable(),
});
export type WebsitePicture = z.infer<typeof WebsitePictureSchema>;

export const WebsitePicturesSchema = z.object({ pictures: z.array(WebsitePictureSchema) });
export type WebsitePictures = z.infer<typeof WebsitePicturesSchema>;

export const PlacedWebsitePictureSchema = z.object({ mediaItemId: z.number().int() });
