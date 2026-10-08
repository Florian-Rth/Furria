import { ALTCHA_FIELD } from '@/lib/altcha/altcha-proof';
import type { ApiFieldFailure } from '@/lib/api/errors';
import { ApiError, RequestBlockedError } from '@/lib/api/errors';
import {
  applyBlockedMessage,
  applyProofRefusedMessage,
  applyRateLimitedMessage,
  applyUnavailableMessage,
} from './apply-content';
import type { MembershipApplicationForm } from './schemas';

export type ApplyFieldName = Exclude<keyof MembershipApplicationForm, 'honeypot'>;

export interface ApplyFieldFailure {
  name: ApplyFieldName;
  message: string;
}

export type ApplyNoticeKind = 'unavailable' | 'blocked' | 'rateLimited' | 'proofRefused';

export interface ApplyFailure {
  fields: ApplyFieldFailure[];
  noticeKind: ApplyNoticeKind | null;
  offersMail: boolean;
}

const FIELD_FAILURE_STATUS = 400;
const REFUSED_STATUS = 422;
const RATE_LIMITED_STATUS = 429;

const FORM_FIELD_OF_API_FIELD = new Map<string, ApplyFieldName>([
  ['firstName', 'firstName'],
  ['lastName', 'lastName'],
  ['birthDate', 'birthDate'],
  ['street', 'street'],
  ['postalCode', 'postalCode'],
  ['city', 'city'],
  ['email', 'email'],
  ['phone', 'phone'],
  ['consentAccepted', 'consent'],
]);

const APPLY_NOTICES: Record<ApplyNoticeKind, string> = {
  unavailable: applyUnavailableMessage,
  blocked: applyBlockedMessage,
  rateLimited: applyRateLimitedMessage,
  proofRefused: applyProofRefusedMessage,
};

const UNAVAILABLE: ApplyFailure = { fields: [], noticeKind: 'unavailable', offersMail: true };

const BLOCKED: ApplyFailure = { fields: [], noticeKind: 'blocked', offersMail: true };

const RATE_LIMITED: ApplyFailure = { fields: [], noticeKind: 'rateLimited', offersMail: false };

const PROOF_REFUSED: ApplyFailure = { fields: [], noticeKind: 'proofRefused', offersMail: true };

const toFormField = (failure: ApiFieldFailure): ApplyFieldFailure[] => {
  const name = FORM_FIELD_OF_API_FIELD.get(failure.field);

  return name === undefined ? [] : [{ name, message: failure.message }];
};

const toBirthDateRefusal = (failures: readonly ApiFieldFailure[]): ApplyFailure => {
  const [refusal] = failures;

  return refusal === undefined
    ? UNAVAILABLE
    : {
        fields: [{ name: 'birthDate', message: refusal.message }],
        noticeKind: null,
        offersMail: false,
      };
};

const toFieldRefusal = (failures: readonly ApiFieldFailure[]): ApplyFailure => {
  if (failures.some((failure) => failure.field === ALTCHA_FIELD)) {
    return PROOF_REFUSED;
  }

  const fields = failures.flatMap(toFormField);

  return fields.length === 0 ? UNAVAILABLE : { fields, noticeKind: null, offersMail: false };
};

const toApiFailure = (error: ApiError): ApplyFailure => {
  if (error.status === RATE_LIMITED_STATUS) {
    return RATE_LIMITED;
  }

  if (error.status === REFUSED_STATUS) {
    return toBirthDateRefusal(error.failures);
  }

  return error.status === FIELD_FAILURE_STATUS ? toFieldRefusal(error.failures) : UNAVAILABLE;
};

export const toApplyFailure = (error: Error | null): ApplyFailure | null => {
  if (error === null) {
    return null;
  }

  if (error instanceof RequestBlockedError) {
    return BLOCKED;
  }

  return error instanceof ApiError ? toApiFailure(error) : UNAVAILABLE;
};

export const toApplyNotice = (failure: ApplyFailure | null): string | null =>
  failure === null || failure.noticeKind === null ? null : APPLY_NOTICES[failure.noticeKind];
