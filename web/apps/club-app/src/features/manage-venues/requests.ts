import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type { CreatedVenue, ManagedVenuesResponse, VenueForm } from './schemas';
import { CreatedVenueSchema, ManagedVenuesResponseSchema } from './schemas';

const toBody = (form: VenueForm): Record<string, string | null> => ({
  name: form.name,
  street: form.street,
  zip: form.zip,
  city: form.city,
  hint: form.hint === '' ? null : form.hint,
});

export const requestManagedVenues = (accessToken: string): Promise<ManagedVenuesResponse> =>
  apiFetch('/api/manage/venues', { schema: ManagedVenuesResponseSchema, accessToken });

export const requestVenueCreation = (form: VenueForm, accessToken: string): Promise<CreatedVenue> =>
  apiFetch('/api/manage/venues', {
    method: 'POST',
    body: toBody(form),
    schema: CreatedVenueSchema,
    accessToken,
  });

export const requestVenueUpdate = (
  venueId: number,
  form: VenueForm,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/manage/venues/${venueId}`, {
    method: 'PUT',
    body: toBody(form),
    schema: NoContentSchema,
    accessToken,
  });

export const requestVenueArchival = (venueId: number, accessToken: string): Promise<void> =>
  apiFetch(`/api/manage/venues/${venueId}/archive`, {
    method: 'POST',
    body: {},
    schema: NoContentSchema,
    accessToken,
  });

export const requestVenueRestoration = (venueId: number, accessToken: string): Promise<void> =>
  apiFetch(`/api/manage/venues/${venueId}/restore`, {
    method: 'POST',
    body: {},
    schema: NoContentSchema,
    accessToken,
  });
