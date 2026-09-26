import { apiFetch } from '@/lib/api/api-fetch';
import type { SessionTokens } from '@/lib/api/schemas';
import { NoContentSchema, SessionTokensSchema } from '@/lib/api/schemas';
import type { LoginEmailChange, LoginEmailForm, PasswordForm } from './schemas';
import { LoginEmailChangeSchema } from './schemas';

export const requestLoginEmailChange = (
  form: LoginEmailForm,
  accessToken: string,
): Promise<LoginEmailChange> =>
  apiFetch('/api/auth/me/login-email', {
    method: 'PUT',
    body: { loginEmail: form.loginEmail, updateContactEmail: form.updateContactEmail },
    schema: LoginEmailChangeSchema,
    accessToken,
  });

export const requestLoginEmailConfirmation = (code: string, accessToken: string): Promise<void> =>
  apiFetch('/api/auth/me/login-email/confirmation', {
    method: 'POST',
    body: { code },
    schema: NoContentSchema,
    accessToken,
  });

export const requestPasswordChange = (
  form: PasswordForm,
  accessToken: string,
): Promise<SessionTokens> =>
  apiFetch('/api/auth/me/password', {
    method: 'PUT',
    body: { currentPassword: form.currentPassword, newPassword: form.newPassword },
    schema: SessionTokensSchema,
    accessToken,
  });

export const requestLogoutEverywhere = (accessToken: string): Promise<void> =>
  apiFetch('/api/auth/me/logout-everywhere', {
    method: 'POST',
    schema: NoContentSchema,
    accessToken,
  });

export const requestAccountDeletion = (password: string, accessToken: string): Promise<void> =>
  apiFetch('/api/auth/me', {
    method: 'DELETE',
    body: { password },
    schema: NoContentSchema,
    accessToken,
  });
