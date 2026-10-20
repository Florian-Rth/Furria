import type { KkIconName, KkStepState } from '@furria/ui';
import {
  toDayNumberLabel,
  toLocalIsoDay,
  toTimeSpanLabel,
  toWeekdayEyebrow,
} from '@/lib/calendar-days';
import { formatPriceCents, toEventStatusShortLabel } from '@/lib/event-copy';
import { formatIsoDay } from '@/lib/membership-labels';
import type { DetailCheck } from './detail-checks';
import type { BoardCell, StateTally } from './event-board';
import type { TallyView } from './event-board-copy';
import { toCellFactLabel, toTallyView } from './event-board-copy';
import { boardStateOf, daysBetween, stepStatusOf } from './event-plan';
import { toDueLabel, toShortDay } from './event-plan-copy';
import { toClockLabel, toEventWhenLabel } from './events-labels';
import type { EventDetails, EventPaneKey, EventStepKey } from './schemas';

export const CHECK_LABELS: Record<DetailCheck, string> = {
  when: 'Wann',
  doors: 'Einlass',
  venue: 'Ort',
  teaser: 'Kurztext',
  description: 'Beschreibung',
  picture: 'Bild',
  ageHint: 'Altershinweis',
};

export const CHECK_ICONS: Record<DetailCheck, KkIconName> = {
  when: 'calendar',
  doors: 'door',
  venue: 'place',
  teaser: 'teaser',
  description: 'paragraph',
  picture: 'image',
  ageHint: 'info',
};

export const CHECK_LINES: Partial<Record<DetailCheck, number>> = { description: 2 };

const MISSING = 'fehlt';

export const toCheckValue = (event: EventDetails, key: DetailCheck): string => {
  switch (key) {
    case 'when':
      return toEventWhenLabel(event);
    case 'doors':
      return toClockLabel(event.doorsOpenAt) ?? MISSING;
    case 'venue':
      return event.venueName ?? MISSING;
    case 'teaser':
      return event.teaser;
    case 'description':
      return event.description ?? MISSING;
    case 'picture':
      return event.picture === null ? MISSING : 'gesetzt';
    case 'ageHint':
      return event.ageHint ?? 'keiner';
  }
};

export const FIX_LABELS = { edit: 'Ergänzen', picture: 'Bild setzen' } as const;

const PANE_STEPS: Partial<Record<EventPaneKey, EventStepKey>> = {
  details: 'details',
  tickets: 'tickets',
  review: 'review',
};

export const toPaneDueLabel = (
  event: EventDetails,
  pane: EventPaneKey,
  cell: BoardCell,
  todayIsoDay: string,
): string => {
  const step = PANE_STEPS[pane];
  const status = step === undefined ? null : stepStatusOf(event, step);

  if (step === undefined || status === null) {
    return toCellFactLabel(cell.fact);
  }

  if (status.state === 'overdue') {
    return `fällig war ${toShortDay(status.dueOn)}`;
  }

  return toDueLabel(
    {
      state: boardStateOf(status.state, step, event.currentStep),
      dueOn: status.dueOn,
      opensOn: status.opensOn,
    },
    daysBetween(todayIsoDay, status.dueOn),
  );
};

export const toPaneEyebrow = (event: Pick<EventDetails, 'title' | 'startsAt'>): string =>
  `${toWeekdayEyebrow(event.startsAt)} ${toDayNumberLabel(event.startsAt)} · ${event.title}`;

export const toOnlineSince = (publishedAt: string): string =>
  formatIsoDay(toLocalIsoDay(publishedAt));

export const toPriceValue = (priceCents: number | null): string =>
  priceCents === null ? MISSING : formatPriceCents(priceCents);

export const toCountValue = (count: number, one: string, many: string): string =>
  `${count} ${count === 1 ? one : many}`;

export const toWaitingValue = (days: number | null): string => {
  if (days === null) {
    return '—';
  }

  return days === 0 ? 'seit heute' : `seit ${days} ${days === 1 ? 'Tag' : 'Tagen'}`;
};

export const toStepDue = (event: EventDetails, cell: BoardCell): string | undefined => {
  const step = PANE_STEPS[cell.pane];
  const status = step === undefined ? null : stepStatusOf(event, step);

  if (status === null || cell.column === 'deadline') {
    return undefined;
  }

  switch (status.state) {
    case 'done':
      return undefined;
    case 'overdue':
      return `fällig war ${toShortDay(status.dueOn)}`;
    case 'open':
      return `bis ${toShortDay(status.dueOn)}`;
    case 'waiting':
      return `bis ${toShortDay(status.dueOn)}`;
  }
};

export interface EventFactCopy {
  key: string;
  label: string;
  value: string;
  icon: KkIconName;
  state?: KkStepState;
}

const toCountdownValue = (days: number): string => {
  if (days === 0) {
    return 'heute';
  }

  return `${Math.abs(days)} ${Math.abs(days) === 1 ? 'Tag' : 'Tage'}`;
};

export const toEventFacts = (event: EventDetails, todayIsoDay: string): EventFactCopy[] => {
  const days = daysBetween(todayIsoDay, toLocalIsoDay(event.startsAt));
  const doors = toClockLabel(event.doorsOpenAt);

  return [
    {
      key: 'time',
      label: 'Beginn',
      value: toTimeSpanLabel(event.startsAt, event.endsAt),
      icon: 'clock',
    },
    {
      key: 'doors',
      label: 'Einlass',
      value: doors ?? MISSING,
      icon: 'door',
      state: doors === null ? 'open' : undefined,
    },
    {
      key: 'venue',
      label: 'Ort',
      value: event.venueName ?? MISSING,
      icon: 'place',
      state: event.venueName === null ? 'open' : undefined,
    },
    {
      key: 'price',
      label: 'Preis',
      value: toPriceValue(event.priceCents),
      icon: 'fees',
      state: event.priceCents === null ? 'open' : undefined,
    },
    { key: 'sales', label: 'Verkauf', value: toEventStatusShortLabel(event), icon: 'storefront' },
    {
      key: 'countdown',
      label: days < 0 ? 'Vorbei seit' : 'Noch',
      value: toCountdownValue(days),
      icon: 'calendar',
    },
  ];
};

export interface HeadChip {
  key: string;
  state: KkStepState;
  label: string;
}

export interface EventHeadView {
  eyebrow: string;
  cancelled: boolean;
  chips: HeadChip[];
  tally: TallyView;
}

const toHeadChips = (event: EventDetails): HeadChip[] => {
  if (event.status === 'cancelled') {
    return [{ key: 'cancelled', state: 'off', label: 'abgesagt' }];
  }

  return [
    event.publishedAt === null
      ? { key: 'website', state: 'open', label: 'nicht auf der Website' }
      : { key: 'website', state: 'done', label: 'auf der Website' },
    { key: 'sales', state: 'done', label: toEventStatusShortLabel(event) },
  ];
};

export const toEventHeadView = (event: EventDetails, tally: StateTally): EventHeadView => ({
  eyebrow: `${toWeekdayEyebrow(event.startsAt)} ${toDayNumberLabel(event.startsAt)} · ${toTimeSpanLabel(event.startsAt, event.endsAt)} · ${event.venueName ?? MISSING}`,
  cancelled: event.status === 'cancelled',
  chips: toHeadChips(event),
  tally: toTallyView(tally),
});
