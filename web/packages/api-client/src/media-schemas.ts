import { z } from 'zod';

type MediaUrlSchema = z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;

type PictureSchema = z.ZodObject<{
  smallUrl: MediaUrlSchema;
  mediumUrl: MediaUrlSchema;
  largeUrl: MediaUrlSchema;
}>;

export interface MediaSchemas {
  MediaUrlSchema: MediaUrlSchema;
  PictureSchema: PictureSchema;
}

export const createMediaSchemas = (apiUrlOf: (path: string) => string): MediaSchemas => {
  const MediaUrlSchema = z.string().min(1).transform(apiUrlOf);

  return {
    MediaUrlSchema,
    PictureSchema: z.object({
      smallUrl: MediaUrlSchema,
      mediumUrl: MediaUrlSchema,
      largeUrl: MediaUrlSchema,
    }),
  };
};

export type Picture = z.infer<PictureSchema>;
