import type { KkSelectOption } from '@furria/ui';
import type { RunningVenue } from '@/features/calendar';
import { toDayTime, toInstant, toTimeChoices } from '@/features/calendar/calendar-authoring';
import { toIsoDay } from '@/lib/day';
import { toPriceCents, toPriceText } from './event-price';
import type { EventDetails, EventForm } from './schemas';

const NO_VALUE = '';
const DEFAULT_START_TIME = '19:00';
const DEFAULT_END_TIME = '23:30';
const DEFAULT_PRESALE_TIME = '10:00';
const SECONDS_SUFFIX = ':00';
const NO_DOORS_LABEL = 'Nicht angegeben';
const ARCHIVED_SUFFIX = ' — archiviert';

export interface EventPayload {
  title: string;
  startsAt: string;
  endsAt: string | null;
  doorsOpenAt: string | null;
  venueId: number;
  teaser: string;
  description: string | null;
  ageHint: string | null;
  priceCents: number | null;
  presaleStartsAt: string | null;
}

const toWritten = (value: string): string | null => {
  const trimmed = value.trim();

  return trimmed === NO_VALUE ? null : trimmed;
};

export const toEventPayload = (form: EventForm): EventPayload => ({
  title: form.title.trim(),
  startsAt: toInstant(form.startDay, form.startTime),
  endsAt: form.endDay === NO_VALUE ? null : toInstant(form.endDay, form.endTime),
  doorsOpenAt: form.doorsOpenAt === NO_VALUE ? null : `${form.doorsOpenAt}${SECONDS_SUFFIX}`,
  venueId: Number(form.venueId),
  teaser: form.teaser.trim(),
  description: toWritten(form.description),
  ageHint: toWritten(form.ageHint),
  priceCents: toPriceCents(form.price),
  presaleStartsAt:
    form.presaleDay === NO_VALUE ? null : toInstant(form.presaleDay, form.presaleTime),
});

export const toEventFormValues = (event: EventDetails | null, today: Date): EventForm => {
  if (event === null) {
    return {
      title: '',
      startDay: toIsoDay(today),
      startTime: DEFAULT_START_TIME,
      endDay: NO_VALUE,
      endTime: DEFAULT_END_TIME,
      doorsOpenAt: NO_VALUE,
      venueId: NO_VALUE,
      teaser: '',
      description: '',
      ageHint: '',
      price: '',
      presaleDay: NO_VALUE,
      presaleTime: DEFAULT_PRESALE_TIME,
    };
  }

  const start = toDayTime(event.startsAt);
  const end = event.endsAt === null ? null : toDayTime(event.endsAt);
  const presale = event.presaleStartsAt === null ? null : toDayTime(event.presaleStartsAt);

  return {
    title: event.title,
    startDay: start.day,
    startTime: start.time,
    endDay: end?.day ?? NO_VALUE,
    endTime: end?.time ?? DEFAULT_END_TIME,
    doorsOpenAt: event.doorsOpenAt ?? NO_VALUE,
    venueId: event.venueId === null ? NO_VALUE : String(event.venueId),
    teaser: event.teaser,
    description: event.description ?? '',
    ageHint: event.ageHint ?? '',
    price: toPriceText(event.priceCents),
    presaleDay: presale?.day ?? NO_VALUE,
    presaleTime: presale?.time ?? DEFAULT_PRESALE_TIME,
  };
};

export const toEventVenueOptions = (
  venues: readonly RunningVenue[],
  event: EventDetails | null,
): KkSelectOption[] => {
  const offered = venues.map((venue) => ({ value: String(venue.venueId), label: venue.name }));
  const heldVenueId = event?.venueId ?? null;

  if (heldVenueId === null || venues.some((venue) => venue.venueId === heldVenueId)) {
    return offered;
  }

  return [
    ...offered,
    { value: String(heldVenueId), label: `${event?.venueName ?? ''}${ARCHIVED_SUFFIX}` },
  ];
};

export const toDoorsOptions = (): KkSelectOption[] => [
  { value: NO_VALUE, label: NO_DOORS_LABEL },
  ...toTimeChoices().map((time) => ({ value: time, label: time })),
];
