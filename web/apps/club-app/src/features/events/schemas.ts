import { z } from 'zod';
import { CalendarCollisionSchema } from '@/features/calendar/schemas';
import { ToDoSchema } from '@/features/to-dos/schemas';
import { ClockTimeSchema, PictureEditingSchema, PictureSchema } from '@/lib/api/schemas';
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

export const EVENT_STEP_KEYS = ['details', 'tickets', 'runningOrder', 'review'] as const;
export const EventStepKeySchema = z.enum(EVENT_STEP_KEYS);
export type EventStepKey = z.infer<typeof EventStepKeySchema>;

export const EVENT_PANE_KEYS = [
  'website',
  'details',
  'tickets',
  'requests',
  'runningOrder',
  'review',
] as const;
export const EventPaneKeySchema = z.enum(EVENT_PANE_KEYS);
export type EventPaneKey = z.infer<typeof EventPaneKeySchema>;

export const BOARD_FILTERS = ['all', 'overdue', 'dueSoon', 'offline', 'requests', 'past'] as const;
export const BoardFilterSchema = z.enum(BOARD_FILTERS);
export type BoardFilter = z.infer<typeof BoardFilterSchema>;

export const EventsSearchSchema = z.object({
  event: z.coerce.number().int().positive().optional().catch(undefined),
  step: EventPaneKeySchema.optional().catch(undefined),
  filter: BoardFilterSchema.optional().catch(undefined),
});
export type EventsSearch = z.infer<typeof EventsSearchSchema>;

export const EventSearchSchema = z.object({
  step: EventPaneKeySchema.optional().catch(undefined),
});
export type EventSearch = z.infer<typeof EventSearchSchema>;

export const EventStepStateSchema = z.enum(['done', 'overdue', 'open', 'waiting']);
export type EventStepState = z.infer<typeof EventStepStateSchema>;

export const MissingEventDetailSchema = z.enum([
  'venue',
  'doorsOpenAt',
  'description',
  'picture',
  'published',
]);
export type MissingEventDetail = z.infer<typeof MissingEventDetailSchema>;

const IsoDaySchema = z.iso.date();

export const EventStepStatusSchema = z.object({
  step: EventStepKeySchema,
  state: EventStepStateSchema,
  dueOn: IsoDaySchema,
  opensOn: IsoDaySchema.nullable(),
});
export type EventStepStatus = z.infer<typeof EventStepStatusSchema>;

export const EventTicketRequestTallySchema = z.object({
  open: z.number().int().nonnegative(),
  cards: z.number().int().nonnegative(),
  oldestRequestedAt: z.iso.datetime({ offset: true }).nullable(),
});
export type EventTicketRequestTally = z.infer<typeof EventTicketRequestTallySchema>;

export const EventReviewTallySchema = z.object({
  publishedAlbums: z.number().int().nonnegative(),
  publishedNews: z.number().int().nonnegative(),
});
export type EventReviewTally = z.infer<typeof EventReviewTallySchema>;

const EventPlanningFields = {
  publishedAt: z.iso.datetime({ offset: true }).nullable(),
  createdAt: z.iso.datetime({ offset: true }),
  detailsMissing: z.array(MissingEventDetailSchema),
  ticketRequests: EventTicketRequestTallySchema,
  review: EventReviewTallySchema,
  steps: z.array(EventStepStatusSchema),
  currentStep: EventStepKeySchema.nullable(),
};

export const EventSummarySchema = z.object({
  eventId: z.number().int(),
  title: z.string(),
  startsAt: z.iso.datetime({ offset: true }),
  endsAt: z.iso.datetime({ offset: true }).nullable(),
  venueName: z.string().nullable(),
  presaleStartsAt: z.iso.datetime({ offset: true }).nullable(),
  status: EventSalesStatusSchema,
  isOver: z.boolean(),
  picture: PictureSchema.nullable(),
  priceCents: z.number().int().nullable(),
  doorsOpenAt: ClockTimeSchema.nullable(),
  ...EventPlanningFields,
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
  picture: PictureEditingSchema.nullable(),
  ...EventPlanningFields,
});
export type EventDetails = z.infer<typeof EventDetailsSchema>;

export const EventPictureFromGallerySchema = z.object({ mediaItemId: z.number().int() });

export const WrittenEventSchema = z.object({
  eventId: z.number().int(),
  venueCollisions: z.array(CalendarCollisionSchema),
});
export type WrittenEvent = z.infer<typeof WrittenEventSchema>;

const PRICE_PATTERN = /^\d{1,4}([.,]\d{1,2})?$/;
const NO_VALUE = '';

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
    doorsOpenAt: z.string(),
    venueId: z.string().min(1, 'Die Veranstaltung braucht einen Ort.'),
    teaser: z
      .string()
      .trim()
      .min(1, 'Die Veranstaltung braucht eine Kurzbeschreibung.')
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
