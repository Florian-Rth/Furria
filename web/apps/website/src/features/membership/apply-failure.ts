import type { ApiFailure, ApiFieldFailure } from '@furria/api-client';
import { apiFailureOf } from '@furria/api-client';
import { ALTCHA_FIELD } from '@/lib/altcha/altcha-proof';
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

const toApiFailure = (failure: ApiFailure): ApplyFailure => {
  switch (failure.kind) {
    case 'unreachable':
      return BLOCKED;
    case 'throttled':
      return RATE_LIMITED;
    case 'refused':
      if (failure.status === REFUSED_STATUS) {
        return toBirthDateRefusal(failure.fields);
      }
      return failure.status === FIELD_FAILURE_STATUS ? toFieldRefusal(failure.fields) : UNAVAILABLE;
    default:
      return UNAVAILABLE;
  }
};

export const toApplyFailure = (error: Error | null): ApplyFailure | null => {
  if (error === null) {
    return null;
  }

  const failure = apiFailureOf(error);

  return failure === null ? UNAVAILABLE : toApiFailure(failure);
};

export const toApplyNotice = (failure: ApplyFailure | null): string | null =>
  failure === null || failure.noticeKind === null ? null : APPLY_NOTICES[failure.noticeKind];
