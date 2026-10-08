import { z } from 'zod';
import { CalendarCollisionSchema } from '@/features/calendar';
import { ToDoSchema } from '@/features/to-dos';
import { ClockTimeSchema } from '@/lib/api/schemas';
import { EVENT_SALES_STATUS_KEYS, TICKET_AVAILABILITY_KEYS } from '@/lib/event-copy';
import { toWrittenPriceCents } from './event-price';

export const EVENT_TITLE_MAX_LENGTH = 80;
export const EVENT_TEASER_MAX_LENGTH = 160;
export const EVENT_DESCRIPTION_MAX_LENGTH = 2000;
export const EVENT_AGE_HINT_MAX_LENGTH = 40;
export const EVENT_MAX_PRICE_CENTS = 100_000;

export const EventSalesStatusSchema = z.enum(EVENT_SALES_STATUS_KEYS);
export type EventSalesStatus = z.infer<typeof EventSalesStatusSchema>;

export const TicketAvailabilitySchema = z.enum(TICKET_AVAILABILITY_KEYS);
export type TicketAvailability = z.infer<typeof TicketAvailabilitySchema>;

export const EventSummarySchema = z.object({
  eventId: z.number().int(),
  title: z.string(),
  startsAt: z.iso.datetime({ offset: true }),
  endsAt: z.iso.datetime({ offset: true }).nullable(),
  venueName: z.string().nullable(),
  presaleStartsAt: z.iso.datetime({ offset: true }).nullable(),
  status: EventSalesStatusSchema,
  isOver: z.boolean(),
});
export type EventSummary = z.infer<typeof EventSummarySchema>;

export const EventsResponseSchema = z.object({ events: z.array(EventSummarySchema) });
export type EventsResponse = z.infer<typeof EventsResponseSchema>;

export const EventDetailsSchema = z.object({
  eventId: z.number().int(),
  title: z.string(),
  startsAt: z.iso.datetime({ offset: true }),
  endsAt: z.iso.datetime({ offset: true }).nullable(),
  doorsOpenAt: ClockTimeSchema.nullable(),
  venueId: z.number().int().nullable(),
  venueName: z.string().nullable(),
  teaser: z.string(),
  description: z.string().nullable(),
  ageHint: z.string().nullable(),
  priceCents: z.number().int().nullable(),
  presaleStartsAt: z.iso.datetime({ offset: true }).nullable(),
  ticketAvailability: TicketAvailabilitySchema,
  cancelledAt: z.iso.datetime({ offset: true }).nullable(),
  status: EventSalesStatusSchema,
  isOver: z.boolean(),
});
export type EventDetails = z.infer<typeof EventDetailsSchema>;

export const WrittenEventSchema = z.object({
  eventId: z.number().int(),
  venueCollisions: z.array(CalendarCollisionSchema),
});
export type WrittenEvent = z.infer<typeof WrittenEventSchema>;

const PRICE_PATTERN = /^\d{1,4}([.,]\d{1,2})?$/;
const NO_VALUE = '';

const END_BEFORE_START_MESSAGE = 'Das Ende muss nach dem Beginn liegen.';
const DOORS_AFTER_START_MESSAGE = 'Der Einlass liegt vor dem Beginn.';
const PRESALE_AFTER_START_MESSAGE = 'Der Vorverkauf beginnt vor der Veranstaltung.';
const PRICE_TOO_HIGH_MESSAGE = 'Höchstens 1000 €.';

export const EventFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Die Veranstaltung braucht einen Titel.')
      .max(EVENT_TITLE_MAX_LENGTH, `Höchstens ${EVENT_TITLE_MAX_LENGTH} Zeichen.`),
    startDay: z.string().min(1, 'Die Veranstaltung braucht einen Tag.'),
    startTime: z.string().min(1, 'Die Veranstaltung braucht eine Uhrzeit.'),
    endDay: z.string(),
    endTime: z.string(),
    doorsOpenAt: z.string(),
    venueId: z.string().min(1, 'Die Veranstaltung braucht einen Ort.'),
    teaser: z
      .string()
      .trim()
      .min(1, 'Die Veranstaltung braucht einen Anreißer.')
      .max(EVENT_TEASER_MAX_LENGTH, `Höchstens ${EVENT_TEASER_MAX_LENGTH} Zeichen.`),
    description: z
      .string()
      .max(EVENT_DESCRIPTION_MAX_LENGTH, `Höchstens ${EVENT_DESCRIPTION_MAX_LENGTH} Zeichen.`),
    ageHint: z
      .string()
      .trim()
      .max(EVENT_AGE_HINT_MAX_LENGTH, `Höchstens ${EVENT_AGE_HINT_MAX_LENGTH} Zeichen.`),
    price: z
      .string()
      .trim()
      .refine(
        (price) => price === NO_VALUE || PRICE_PATTERN.test(price),
        'Gib den Preis in Euro an, etwa 22,50.',
      ),
    presaleDay: z.string(),
    presaleTime: z.string(),
  })
  .superRefine((form, ctx) => {
    const startsAt = `${form.startDay}T${form.startTime}`;

    if (form.endDay !== NO_VALUE && `${form.endDay}T${form.endTime}` <= startsAt) {
      ctx.addIssue({ code: 'custom', message: END_BEFORE_START_MESSAGE, path: ['endTime'] });
    }
    if (form.doorsOpenAt !== NO_VALUE && form.doorsOpenAt >= form.startTime) {
      ctx.addIssue({ code: 'custom', message: DOORS_AFTER_START_MESSAGE, path: ['doorsOpenAt'] });
    }
    if (form.presaleDay !== NO_VALUE && `${form.presaleDay}T${form.presaleTime}` >= startsAt) {
      ctx.addIssue({
        code: 'custom',
        message: PRESALE_AFTER_START_MESSAGE,
        path: ['presaleTime'],
      });
    }
    if (PRICE_PATTERN.test(form.price) && toWrittenPriceCents(form.price) > EVENT_MAX_PRICE_CENTS) {
      ctx.addIssue({ code: 'custom', message: PRICE_TOO_HIGH_MESSAGE, path: ['price'] });
    }
  });
export type EventForm = z.infer<typeof EventFormSchema>;

export const TicketRequestSchema = z.object({
  ticketRequestId: z.number().int(),
  eventId: z.number().int(),
  eventTitle: z.string(),
  eventStartsAt: z.iso.datetime({ offset: true }),
  ticketCount: z.number().int().positive(),
  name: z.string(),
  phone: z.string(),
  email: z.string(),
  message: z.string().nullable(),
  requestedAt: z.iso.datetime({ offset: true }),
});
export type TicketRequest = z.infer<typeof TicketRequestSchema>;

export const TicketRequestsResponseSchema = z.object({
  ticketRequests: z.array(TicketRequestSchema),
  toDo: ToDoSchema.nullable(),
});
export type TicketRequestsResponse = z.infer<typeof TicketRequestsResponseSchema>;
