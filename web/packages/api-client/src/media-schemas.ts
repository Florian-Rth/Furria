import { z } from 'zod';

type MediaUrlSchema = z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;

type PictureSchema = z.ZodObject<{
  smallUrl: MediaUrlSchema;
  mediumUrl: MediaUrlSchema;
  largeUrl: MediaUrlSchema;
}>;

type SessionLogoSchema = z.ZodObject<{
  picture: PictureSchema;
  aspect: z.ZodNumber;
}>;

type PublicWebsitePictureSchema = z.ZodObject<{
  slot: z.ZodString;
  position: z.ZodNumber;
  width: z.ZodNumber;
  height: z.ZodNumber;
  alt: z.ZodNullable<z.ZodString>;
  smallUrl: MediaUrlSchema;
  mediumUrl: MediaUrlSchema;
  largeUrl: MediaUrlSchema;
}>;

type PublicWebsitePicturesSchema = z.ZodObject<{
  pictures: z.ZodArray<PublicWebsitePictureSchema>;
}>;

export interface MediaSchemas {
  MediaUrlSchema: MediaUrlSchema;
  PictureSchema: PictureSchema;
  SessionLogoSchema: SessionLogoSchema;
  PublicWebsitePicturesSchema: PublicWebsitePicturesSchema;
}

export const createMediaSchemas = (apiUrlOf: (path: string) => string): MediaSchemas => {
  const MediaUrlSchema = z.string().min(1).transform(apiUrlOf);
  const PictureSchema = z.object({
    smallUrl: MediaUrlSchema,
    mediumUrl: MediaUrlSchema,
    largeUrl: MediaUrlSchema,
  });

  return {
    MediaUrlSchema,
    PictureSchema,
    SessionLogoSchema: z.object({ picture: PictureSchema, aspect: z.number().positive() }),
    PublicWebsitePicturesSchema: z.object({
      pictures: z.array(
        z.object({
          slot: z.string(),
          position: z.number().int(),
          width: z.number().int(),
          height: z.number().int(),
          alt: z.string().nullable(),
          smallUrl: MediaUrlSchema,
          mediumUrl: MediaUrlSchema,
          largeUrl: MediaUrlSchema,
        }),
      ),
    }),
  };
};

export type Picture = z.infer<PictureSchema>;
export type SessionLogo = z.infer<SessionLogoSchema>;
export type PublicWebsitePictures = z.infer<PublicWebsitePicturesSchema>;
export type PublicWebsitePicture = z.infer<PublicWebsitePictureSchema>;
