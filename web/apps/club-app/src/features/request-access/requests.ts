import { apiFetch } from '@/lib/api/api-fetch';
import type { NoContent } from '@/lib/api/schemas';
import { NoContentSchema } from '@/lib/api/schemas';

export const requestAccess = (email: string): Promise<NoContent> =>
  apiFetch('/api/auth/access/request', {
    method: 'POST',
    body: { email },
    schema: NoContentSchema,
  });
