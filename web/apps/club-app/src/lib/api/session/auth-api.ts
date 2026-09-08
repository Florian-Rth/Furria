import { apiFetch } from '@/lib/api/api-fetch';
import type { LoginRequest, Me, SessionTokens } from '@/lib/api/schemas';
import { MeSchema, NoContentSchema, SessionTokensSchema } from '@/lib/api/schemas';

export const requestLogin = (credentials: LoginRequest): Promise<SessionTokens> =>
  apiFetch('/api/auth/login', {
    method: 'POST',
    body: { email: credentials.email, password: credentials.password },
    schema: SessionTokensSchema,
  });

export const requestRefresh = (refreshToken: string): Promise<SessionTokens> =>
  apiFetch('/api/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
    schema: SessionTokensSchema,
  });

export const requestLogout = (accessToken: string, refreshToken: string): Promise<void> =>
  apiFetch('/api/auth/logout', {
    method: 'POST',
    body: { refreshToken },
    schema: NoContentSchema,
    accessToken,
  });

export const requestMe = (accessToken: string): Promise<Me> =>
  apiFetch('/api/auth/me', { schema: MeSchema, accessToken });
