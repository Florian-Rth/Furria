import type { JsonBody } from '@furria/api-client';
import { INVITATION_PATH, readInvitationToken } from '@/features/redeem/invitation-token';
import type { IntakeLinkState, NewcomerForm } from './schemas';

export type IntakePageStage =
  | 'missing'
  | 'checking'
  | 'open'
  | 'expired'
  | 'used'
  | 'discarded'
  | 'unknown'
  | 'failed';

export interface IntakeLookupStatus {
  state: IntakeLinkState | null;
  failedStatus: number | null;
  failed: boolean;
}

const NOT_FOUND_STATUSES: readonly number[] = [400, 404];
const LINK_ENDED_STATUSES: readonly number[] = [404, 409, 410];

export const intakePageStageOf = (
  token: string | null,
  lookup: IntakeLookupStatus,
): IntakePageStage => {
  if (token === null) {
    return 'missing';
  }
  if (lookup.failedStatus !== null && NOT_FOUND_STATUSES.includes(lookup.failedStatus)) {
    return 'unknown';
  }
  if (lookup.state !== null) {
    return lookup.state;
  }
  return lookup.failed ? 'failed' : 'checking';
};

export const endsLink = (status: number | null): boolean =>
  status !== null && LINK_ENDED_STATUSES.includes(status);

const filledOrNull = (value: string): string | null => (value === '' ? null : value);

export const toSubmitBody = (
  token: string,
  form: NewcomerForm,
  addressRequired: boolean,
): JsonBody => ({
  token,
  firstName: form.firstName,
  lastName: form.lastName,
  birthDate: form.birthDate,
  street: addressRequired ? filledOrNull(form.street) : null,
  zip: addressRequired ? filledOrNull(form.zip) : null,
  city: addressRequired ? filledOrNull(form.city) : null,
  phone: filledOrNull(form.phone),
  email: filledOrNull(form.email),
});

export const invitationHrefOf = (link: string | null): string | null => {
  if (link === null || !URL.canParse(link)) {
    return null;
  }
  const fragment = new URL(link).hash.slice(1);

  return readInvitationToken(fragment) === null ? null : `${INVITATION_PATH}#${fragment}`;
};
