import { apiFetch } from '@/lib/api/api-fetch';
import type { NoContent } from '@/lib/api/schemas';
import { NoContentSchema } from '@/lib/api/schemas';

export interface PasswordResetRequest {
  reset: string;
  password: string;
}

export const requestPasswordReset = (email: string): Promise<NoContent> =>
  apiFetch('/api/auth/password/request-reset', {
    method: 'POST',
    body: { email },
    schema: NoContentSchema,
  });

export const resetPassword = ({ reset, password }: PasswordResetRequest): Promise<NoContent> =>
  apiFetch('/api/auth/password/reset', {
    method: 'POST',
    body: { reset, password },
    schema: NoContentSchema,
  });
