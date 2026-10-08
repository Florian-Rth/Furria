import type { TicketRequestForm, TicketRequestPayload } from './schemas';

const orNull = (value: string): string | null => (value.length === 0 ? null : value);

export const buildTicketRequestPayload = (
  eventId: number,
  values: TicketRequestForm,
  altcha: string,
): TicketRequestPayload => ({
  eventId,
  ticketCount: values.ticketCount,
  name: values.name,
  phone: values.phone,
  email: values.email,
  message: orNull(values.message),
  consentAccepted: values.consent,
  altcha,
});
