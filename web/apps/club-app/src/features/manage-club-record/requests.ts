import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type { ClubContact, ClubIdentity, ClubRecord } from './schemas';
import { ClubRecordSchema } from './schemas';

const CLUB_RECORD_PATH = '/api/manage/club-record';

export const requestClubRecord = (accessToken: string): Promise<ClubRecord> =>
  apiFetch(CLUB_RECORD_PATH, { schema: ClubRecordSchema, accessToken });

export const requestClubIdentityUpdate = (
  identity: ClubIdentity,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${CLUB_RECORD_PATH}/identity`, {
    method: 'PUT',
    body: {
      name: identity.name,
      shortName: identity.shortName,
      foundedYear: identity.foundedYear,
    },
    schema: NoContentSchema,
    accessToken,
  });

export const requestClubContactUpdate = (
  contact: ClubContact,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${CLUB_RECORD_PATH}/contact`, {
    method: 'PUT',
    body: {
      street: contact.street,
      zip: contact.zip,
      city: contact.city,
      email: contact.email,
      phone: contact.phone,
      websiteUrl: contact.websiteUrl,
      instagramUrl: contact.instagramUrl,
      facebookUrl: contact.facebookUrl,
    },
    schema: NoContentSchema,
    accessToken,
  });

export const requestClubAccessUpdate = (ageOfConsent: number, accessToken: string): Promise<void> =>
  apiFetch(`${CLUB_RECORD_PATH}/access`, {
    method: 'PUT',
    body: { ageOfConsent },
    schema: NoContentSchema,
    accessToken,
  });
