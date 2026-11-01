import { z } from 'zod';

export const UploadLinkStateSchema = z.enum(['open', 'expired', 'revoked']);
export type UploadLinkState = z.infer<typeof UploadLinkStateSchema>;

export const UploadLinkCreatorSchema = z.object({
  personId: z.int().positive(),
  firstName: z.string(),
  lastName: z.string(),
});
export type UploadLinkCreator = z.infer<typeof UploadLinkCreatorSchema>;

export const UploadLinkSchema = z.object({
  uploadLinkId: z.int().positive(),
  title: z.string(),
  state: UploadLinkStateSchema,
  token: z.string().nullable(),
  createdAt: z.iso.datetime({ offset: true }),
  expiresAt: z.iso.datetime({ offset: true }),
  revokedAt: z.iso.datetime({ offset: true }).nullable(),
  createdBy: UploadLinkCreatorSchema.nullable(),
  uploadCount: z.int().nonnegative(),
  inboxPhotos: z.int().nonnegative(),
  inboxVideos: z.int().nonnegative(),
});
export type UploadLink = z.infer<typeof UploadLinkSchema>;

export const UploadLinksSchema = z.object({ links: z.array(UploadLinkSchema) });
export type UploadLinks = z.infer<typeof UploadLinksSchema>;

export const CreatedUploadLinkSchema = z.object({
  uploadLinkId: z.int().positive(),
  token: z.string(),
  expiresAt: z.iso.datetime({ offset: true }),
});
export type CreatedUploadLink = z.infer<typeof CreatedUploadLinkSchema>;

export const UploadLinkLookupSchema = z.object({
  title: z.string(),
  state: UploadLinkStateSchema,
  expiresAt: z.iso.datetime({ offset: true }),
});
export type UploadLinkLookup = z.infer<typeof UploadLinkLookupSchema>;
