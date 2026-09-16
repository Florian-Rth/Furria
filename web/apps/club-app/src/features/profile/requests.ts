import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';

export const requestContactVisibility = (
  contactVisibleToMembers: boolean,
  accessToken: string,
): Promise<void> =>
  apiFetch('/api/auth/me/contact-visibility', {
    method: 'PUT',
    body: { contactVisibleToMembers },
    schema: NoContentSchema,
    accessToken,
  });
