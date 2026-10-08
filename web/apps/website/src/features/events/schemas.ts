import { z } from 'zod';
import { EMAIL_MAX_LENGTH, PHONE_PATTERN } from '@/lib/contact-fields';

export const FEWEST_TICKETS = 1;
export const MOST_TICKETS = 10;
export const REQUEST_NAME_MAX_LENGTH = 80;
export const REQUEST_MESSAGE_MAX_LENGTH = 500;

const TOO_LONG_MESSAGE = 'Das sind mehr Zeichen, als wir speichern können.';

export const TicketRequestFormSchema = z.object({
  ticketCount: z
    .number()
    .int()
    .min(FEWEST_TICKETS, 'Wie viele Karten möchtest du?')
    .max(MOST_TICKETS, `Online fragst du höchstens ${MOST_TICKETS} Karten an.`),
  name: z
    .string()
    .trim()
    .min(1, 'Bitte trag deinen Namen ein.')
    .max(REQUEST_NAME_MAX_LENGTH, TOO_LONG_MESSAGE),
  phone: z
    .string()
    .trim()
    .regex(PHONE_PATTERN, 'Bitte trag eine Telefonnummer ein, unter der wir dich erreichen.'),
  email: z
    .string()
    .trim()
    .max(EMAIL_MAX_LENGTH, 'Das sind mehr Zeichen, als eine E-Mail-Adresse haben darf.')
    .pipe(z.email('Bitte trag eine E-Mail-Adresse ein, unter der wir dich erreichen.')),
  message: z.string().trim().max(REQUEST_MESSAGE_MAX_LENGTH, TOO_LONG_MESSAGE),
  consent: z
    .boolean()
    .refine((given) => given, 'Ohne diese Einwilligung dürfen wir die Anfrage nicht annehmen.'),
  honeypot: z.string(),
});

export type TicketRequestForm = z.infer<typeof TicketRequestFormSchema>;

export const DEFAULT_TICKET_COUNT = 2;

export const EMPTY_TICKET_REQUEST: TicketRequestForm = {
  ticketCount: DEFAULT_TICKET_COUNT,
  name: '',
  phone: '',
  email: '',
  message: '',
  consent: false,
  honeypot: '',
};

export const TicketRequestPayloadSchema = z.object({
  eventId: z.number(),
  ticketCount: z.number(),
  name: z.string(),
  phone: z.string(),
  email: z.string(),
  message: z.string().nullable(),
  consentAccepted: z.boolean(),
  altcha: z.string(),
});

export type TicketRequestPayload = z.infer<typeof TicketRequestPayloadSchema>;

export const TicketRequestResponseSchema = z.object({});

export type TicketRequestResponse = z.infer<typeof TicketRequestResponseSchema>;
