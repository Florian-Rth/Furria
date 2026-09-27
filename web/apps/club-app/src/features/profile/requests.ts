import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type { ContactDetailsForm } from './schemas';

const toNullable = (value: string): string | null => (value === '' ? null : value);

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

export const requestContactDetailsUpdate = (
  form: ContactDetailsForm,
  accessToken: string,
): Promise<void> =>
  apiFetch('/api/auth/me/contact-details', {
    method: 'PUT',
    body: {
      email: toNullable(form.email),
      phone: toNullable(form.phone),
      street: toNullable(form.street),
      zip: toNullable(form.zip),
      city: toNullable(form.city),
    },
    schema: NoContentSchema,
    accessToken,
  });
