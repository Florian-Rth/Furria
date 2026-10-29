import type { KkSelectOption } from '@furria/ui/KkSelectField';
import { toDayTime, toInstant } from '@/features/calendar/calendar-authoring';
import type { RunningVenue } from '@/features/calendar/schemas';
import { toIsoDay } from '@/lib/day';
import { toPriceCents, toPriceText } from './event-price';
import type { EventDetails, EventForm, EventPresalePlace } from './schemas';

const NO_VALUE = '';
const DEFAULT_START_TIME = '19:00';
const DEFAULT_PRESALE_TIME = '10:00';
const SECONDS_SUFFIX = ':00';
const ARCHIVED_SUFFIX = ' — archiviert';

export interface EventPayload {
  title: string;
  startsAt: string;
  doorsOpenAt: string | null;
  venueId: number;
  teaser: string;
  description: string | null;
  ageHint: string | null;
  priceCents: number | null;
  presaleStartsAt: string | null;
  presaleVenueIds: number[];
}

const toWritten = (value: string): string | null => {
  const trimmed = value.trim();

  return trimmed === NO_VALUE ? null : trimmed;
};

export const toEventPayload = (form: EventForm): EventPayload => ({
  title: form.title.trim(),
  startsAt: toInstant(form.startDay, form.startTime),
  doorsOpenAt: form.doorsOpenAt === NO_VALUE ? null : `${form.doorsOpenAt}${SECONDS_SUFFIX}`,
  venueId: Number(form.venueId),
  teaser: form.teaser.trim(),
  description: toWritten(form.description),
  ageHint: toWritten(form.ageHint),
  priceCents: toPriceCents(form.price),
  presaleStartsAt:
    form.presaleDay === NO_VALUE ? null : toInstant(form.presaleDay, form.presaleTime),
  presaleVenueIds: form.presaleVenueIds,
});

export const toEventFormValues = (event: EventDetails | null, today: Date): EventForm => {
  if (event === null) {
    return {
      title: '',
      startDay: toIsoDay(today),
      startTime: DEFAULT_START_TIME,
      doorsOpenAt: NO_VALUE,
      venueId: NO_VALUE,
      teaser: '',
      description: '',
      ageHint: '',
      price: '',
      presaleDay: NO_VALUE,
      presaleTime: DEFAULT_PRESALE_TIME,
      presaleVenueIds: [],
    };
  }

  const start = toDayTime(event.startsAt);
  const presale = event.presaleStartsAt === null ? null : toDayTime(event.presaleStartsAt);

  return {
    title: event.title,
    startDay: start.day,
    startTime: start.time,
    doorsOpenAt: event.doorsOpenAt ?? NO_VALUE,
    venueId: event.venueId === null ? NO_VALUE : String(event.venueId),
    teaser: event.teaser,
    description: event.description ?? '',
    ageHint: event.ageHint ?? '',
    price: toPriceText(event.priceCents),
    presaleDay: presale?.day ?? NO_VALUE,
    presaleTime: presale?.time ?? DEFAULT_PRESALE_TIME,
    presaleVenueIds: event.presalePlaces.map((place) => place.venueId),
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

export interface PresalePlaceChoice {
  venueId: number;
  name: string;
  position: number | null;
  isArchived: boolean;
}

export const togglePresaleVenue = (picked: readonly number[], venueId: number): number[] =>
  picked.includes(venueId) ? picked.filter((id) => id !== venueId) : [...picked, venueId];

const positionOf = (picked: readonly number[], venueId: number): number | null => {
  const index = picked.indexOf(venueId);

  return index === -1 ? null : index + 1;
};

export const presalePlaceChoicesOf = (
  venues: readonly RunningVenue[],
  held: readonly EventPresalePlace[],
  picked: readonly number[],
): PresalePlaceChoice[] => {
  const running = venues.map((venue) => ({
    venueId: venue.venueId,
    name: venue.name,
    position: positionOf(picked, venue.venueId),
    isArchived: false,
  }));
  const archived = held
    .filter(
      (place) =>
        picked.includes(place.venueId) && !venues.some((venue) => venue.venueId === place.venueId),
    )
    .map((place) => ({
      venueId: place.venueId,
      name: place.name,
      position: positionOf(picked, place.venueId),
      isArchived: true,
    }));

  return [...running, ...archived];
};

const toPresalePlaceLabel = (choice: PresalePlaceChoice): string => {
  const name = choice.isArchived ? `${choice.name}${ARCHIVED_SUFFIX}` : choice.name;

  return choice.position === null ? name : `${choice.position}. ${name}`;
};

export const toPresalePlaceOptions = (choices: readonly PresalePlaceChoice[]): KkSelectOption[] =>
  choices.map((choice) => ({ value: String(choice.venueId), label: toPresalePlaceLabel(choice) }));
