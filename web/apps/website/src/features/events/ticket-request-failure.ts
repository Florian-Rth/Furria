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

export interface TicketRequestFailure {
  fields: TicketRequestFieldFailure[];
  notice: string | null;
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

const noticeOnly = (
  notice: string,
  offersMail: boolean,
  closesWindow: boolean,
): TicketRequestFailure => ({ fields: [], notice, offersMail, closesWindow });

const UNAVAILABLE = noticeOnly(ticketRequestUnavailableMessage, true, false);
const BLOCKED = noticeOnly(ticketRequestBlockedMessage, true, false);
const RATE_LIMITED = noticeOnly(ticketRequestRateLimitedMessage, false, false);
const PROOF_REFUSED = noticeOnly(ticketRequestProofRefusedMessage, true, false);
const CLOSED = noticeOnly(ticketRequestClosedMessage, false, true);
const GONE = noticeOnly(ticketRequestGoneMessage, false, true);

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
    : { fields, notice: null, offersMail: false, closesWindow: false };
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
