import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';

export const requestWelcomeSeen = (accessToken: string): Promise<void> =>
  apiFetch('/api/auth/me/welcome-seen', {
    method: 'PUT',
    schema: NoContentSchema,
    accessToken,
  });
