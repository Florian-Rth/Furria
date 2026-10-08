import { ALTCHA_FIELD } from '@/lib/altcha/altcha-proof';
import type { ApiFieldFailure } from '@/lib/api/errors';
import { ApiError, RequestBlockedError } from '@/lib/api/errors';
import type { TicketRequestForm } from './schemas';
import {
  ticketRequestBlockedMessage,
  ticketRequestClosedMessage,
  ticketRequestGoneMessage,
  ticketRequestProofRefusedMessage,
  ticketRequestRateLimitedMessage,
  ticketRequestUnavailableMessage,
} from './ticket-request-content';

export type TicketRequestFieldName = Exclude<keyof TicketRequestForm, 'honeypot'>;

export interface TicketRequestFieldFailure {
  name: TicketRequestFieldName;
  message: string;
}

export type TicketRequestNoticeKind =
  | 'unavailable'
  | 'blocked'
  | 'rateLimited'
  | 'proofRefused'
  | 'closed'
  | 'gone';

export interface TicketRequestFailure {
  fields: TicketRequestFieldFailure[];
  noticeKind: TicketRequestNoticeKind | null;
  offersMail: boolean;
  closesWindow: boolean;
}

const FIELD_FAILURE_STATUS = 400;
const NOT_FOUND_STATUS = 404;
const CONFLICT_STATUS = 409;
const RATE_LIMITED_STATUS = 429;

const FORM_FIELD_OF_API_FIELD = new Map<string, TicketRequestFieldName>([
  ['ticketCount', 'ticketCount'],
  ['name', 'name'],
  ['phone', 'phone'],
  ['email', 'email'],
  ['message', 'message'],
  ['consentAccepted', 'consent'],
]);

const TICKET_REQUEST_NOTICES: Record<TicketRequestNoticeKind, string> = {
  unavailable: ticketRequestUnavailableMessage,
  blocked: ticketRequestBlockedMessage,
  rateLimited: ticketRequestRateLimitedMessage,
  proofRefused: ticketRequestProofRefusedMessage,
  closed: ticketRequestClosedMessage,
  gone: ticketRequestGoneMessage,
};

const noticeOnly = (
  noticeKind: TicketRequestNoticeKind,
  offersMail: boolean,
  closesWindow: boolean,
): TicketRequestFailure => ({ fields: [], noticeKind, offersMail, closesWindow });

const UNAVAILABLE = noticeOnly('unavailable', true, false);
const BLOCKED = noticeOnly('blocked', true, false);
const RATE_LIMITED = noticeOnly('rateLimited', false, false);
const PROOF_REFUSED = noticeOnly('proofRefused', true, false);
const CLOSED = noticeOnly('closed', false, true);
const GONE = noticeOnly('gone', false, true);

const toFormField = (failure: ApiFieldFailure): TicketRequestFieldFailure[] => {
  const name = FORM_FIELD_OF_API_FIELD.get(failure.field);

  return name === undefined ? [] : [{ name, message: failure.message }];
};

const toFieldRefusal = (failures: readonly ApiFieldFailure[]): TicketRequestFailure => {
  if (failures.some((failure) => failure.field === ALTCHA_FIELD)) {
    return PROOF_REFUSED;
  }

  const fields = failures.flatMap(toFormField);

  return fields.length === 0
    ? UNAVAILABLE
    : { fields, noticeKind: null, offersMail: false, closesWindow: false };
};

const toApiFailure = (error: ApiError): TicketRequestFailure => {
  switch (error.status) {
    case RATE_LIMITED_STATUS:
      return RATE_LIMITED;
    case CONFLICT_STATUS:
      return CLOSED;
    case NOT_FOUND_STATUS:
      return GONE;
    case FIELD_FAILURE_STATUS:
      return toFieldRefusal(error.failures);
    default:
      return UNAVAILABLE;
  }
};

export const toTicketRequestFailure = (error: Error | null): TicketRequestFailure | null => {
  if (error === null) {
    return null;
  }

  if (error instanceof RequestBlockedError) {
    return BLOCKED;
  }

  return error instanceof ApiError ? toApiFailure(error) : UNAVAILABLE;
};

export const toTicketRequestNotice = (failure: TicketRequestFailure | null): string | null =>
  failure === null || failure.noticeKind === null
    ? null
    : TICKET_REQUEST_NOTICES[failure.noticeKind];
