import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type { CreatedUploadLink, UploadLinkLookup, UploadLinks } from './schemas';
import { CreatedUploadLinkSchema, UploadLinkLookupSchema, UploadLinksSchema } from './schemas';

export const requestUploadLinks = (accessToken: string): Promise<UploadLinks> =>
  apiFetch('/api/gallery/upload-links', { schema: UploadLinksSchema, accessToken });

export const requestUploadLinkCreation = (
  title: string,
  accessToken: string,
): Promise<CreatedUploadLink> =>
  apiFetch('/api/gallery/upload-links', {
    method: 'POST',
    body: { title },
    schema: CreatedUploadLinkSchema,
    accessToken,
  });

export const requestUploadLinkRevocation = (
  uploadLinkId: number,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/gallery/upload-links/${uploadLinkId}/revoke`, {
    method: 'POST',
    schema: NoContentSchema,
    accessToken,
  });

export const requestUploadLinkLookup = (token: string): Promise<UploadLinkLookup> =>
  apiFetch('/api/public/upload-links/lookup', {
    method: 'POST',
    body: { token },
    schema: UploadLinkLookupSchema,
  });
