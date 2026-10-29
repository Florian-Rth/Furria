import type { KkHealthFilterTone } from '@furria/ui/KkHealthStripFilter';
import type { KkHealthLegendEntry } from '@furria/ui/KkHealthStripSummary';
import type { KkIconName } from '@furria/ui/KkIcon';
import type { KkStateGridColumn } from '@furria/ui/KkStateGridRoot';
import type { KkStepLaterItem } from '@furria/ui/KkStepListLater';
import type { KkProgressRingPart } from '@furria/ui/progress-ring';
import type { KkStepState } from '@furria/ui/step-state';
import { toDayNumberLabel, toWeekdayEyebrow } from '@/lib/calendar-days';
import { formatPriceCents, toEventStatusShortLabel } from '@/lib/event-copy';
import type { BoardCell, BoardColumn, CellFact, StateTally } from './event-board';
import { COUNTED_STATES } from './event-board';
import { STEP_TITLES, toFactDetailsLabel, toShortDay } from './event-plan-copy';
import { EVENT_MANAGE_TITLE, toEventRowMeta } from './events-labels';
import type { BoardFilter, EventPaneKey, EventSummary } from './schemas';
import { BOARD_FILTERS, EVENT_PANE_KEYS } from './schemas';

export const CLOSE_LABEL = 'Schließen';
export const LOADING_LABEL = 'Die Veranstaltungen werden geladen';
export const EVENT_LOADING_LABEL = 'Die Veranstaltung wird geladen';
export const GRID_LABEL = 'Stand je Abend';
export const GRID_DATE_LABEL = 'Tag';
export const GRID_EVENT_LABEL = 'Abend';
export const GRID_COUNT_LABEL = 'Tage';
export const HEALTH_LABEL = 'Stand der Session';
export const FILTER_LABEL = 'Abende filtern';
export const STEPS_LABEL = 'Schritte des Abends';
export const FACTS_LABEL = 'Eckdaten des Abends';
export const OPEN_EVENT_LABEL = 'Ganze Seite';
export const EMPTY_FILTER_NOTE = 'Kein Abend in dieser Auswahl.';
export const NEW_EVENT_ACTION_LABEL = 'Veranstaltung anlegen';

export const COLUMN_TITLES: Record<BoardColumn, string> = {
  website: 'Website',
  details: 'Eckdaten',
  tickets: 'Karten',
  review: 'Nachbereitung',
  deadline: 'Nächste Frist',
};

export const PANE_ICONS: Record<EventPaneKey, KkIconName> = {
  website: 'website',
  details: 'factSheet',
  tickets: 'tickets',
  review: 'gallery',
};

export const GRID_COLUMNS: readonly KkStateGridColumn[] = EVENT_PANE_KEYS.map((pane) => ({
  icon: PANE_ICONS[pane],
  label: COLUMN_TITLES[pane],
}));

export const PANE_TITLES: Record<EventPaneKey, string> = {
  website: 'Website',
  details: 'Eckdaten',
  tickets: 'Karten',
  review: 'Nachbereitung',
};

export const STATE_LABELS: Record<KkStepState, string> = {
  done: 'fertig',
  current: 'jetzt',
  overdue: 'überfällig',
  open: 'offen',
  waiting: 'wartet',
  off: '',
};

interface FilterLook {
  icon: KkIconName;
  label: string;
  tone: KkHealthFilterTone;
}

const FILTER_LOOKS: Record<BoardFilter, FilterLook> = {
  all: { icon: 'events', label: 'Alle', tone: 'ink' },
  overdue: { icon: 'alert', label: 'Überfällig', tone: 'overdue' },
  dueSoon: { icon: 'clock', label: 'Bald fällig', tone: 'ink' },
  offline: { icon: 'website', label: 'Nicht online', tone: 'ink' },
  past: { icon: 'archive', label: 'Vergangen', tone: 'ink' },
};

export const QUIET_NOTE = 'keine';

export interface FilterView {
  id: BoardFilter;
  icon: KkIconName;
  label: string;
  count: string | null;
  ariaLabel: string;
  tone: KkHealthFilterTone;
}

const eveningsLabel = (count: number): string => (count === 1 ? '1 Abend' : `${count} Abende`);

export const toFilterViews = (counts: Record<BoardFilter, number>): FilterView[] =>
  BOARD_FILTERS.filter((filter) => filter !== 'past' || counts.past > 0).map((filter) => {
    const look = FILTER_LOOKS[filter];
    const count = counts[filter];

    return {
      id: filter,
      icon: look.icon,
      label: look.label,
      count: count === 0 && filter !== 'all' ? null : String(count),
      ariaLabel: `${look.label}: ${count === 0 ? QUIET_NOTE : eveningsLabel(count)}`,
      tone: count === 0 ? 'ink' : look.tone,
    };
  });

const SEPARATOR = ' · ';
const join = (parts: readonly (string | null)[]): string =>
  parts.filter((part): part is string => part !== null && part !== '').join(SEPARATOR);

const plural = (count: number, one: string, many: string): string =>
  `${count} ${count === 1 ? one : many}`;

export const toRelativeDays = (days: number): string => {
  if (days === 0) {
    return 'heute';
  }

  return days > 0 ? `in ${days} T` : `seit ${-days} T`;
};

const TICKET_FACT_NAMES = { price: 'Preis', presale: 'VVK-Start', places: 'VVK-Stelle' } as const;

const salesLabelOf = (fact: Extract<CellFact, { kind: 'sales' }>): string => {
  const status = toEventStatusShortLabel({
    status: fact.status,
    presaleStartsAt: fact.presaleStartsAt,
  });

  return join([fact.priceCents === null ? null : formatPriceCents(fact.priceCents), status]);
};

export const toCellFactLabel = (fact: CellFact): string => {
  switch (fact.kind) {
    case 'online':
      return `online seit ${toShortDay(fact.sinceDay)}`;
    case 'publishReady':
      return 'bereit zum Veröffentlichen';
    case 'blocked':
      return 'in Vorbereitung';
    case 'neverPublished':
      return 'nie veröffentlicht';
    case 'factsMissing':
      return fact.details.length === 1
        ? `${toFactDetailsLabel(fact.details)} fehlt`
        : `${fact.details.length} Angaben fehlen`;
    case 'factsComplete':
      return 'vollständig';
    case 'ticketFactsMissing':
      return fact.facts.length === 1
        ? `${TICKET_FACT_NAMES[fact.facts[0] ?? 'price']} fehlt`
        : 'Preis und VVK fehlen';
    case 'sales':
      return salesLabelOf(fact);
    case 'review':
      return fact.albums === 0 && fact.news === 0
        ? 'noch nichts'
        : join([plural(fact.albums, 'Album', 'Alben'), plural(fact.news, 'Meldung', 'Meldungen')]);
    case 'reviewOpens':
      return `ab ${toShortDay(fact.opensOn)}`;
    case 'deadline':
      return join([STEP_TITLES[fact.step], toShortDay(fact.dueOn)]);
    case 'allDone':
      return 'alles erledigt';
    case 'cancelled':
      return 'abgesagt';
  }
};

export const toCellGridFact = (fact: CellFact): string =>
  fact.kind === 'cancelled' ? '' : toCellFactLabel(fact);

export const toCellStateLabel = (cell: BoardCell): string =>
  cell.fact.kind === 'deadline' ? toRelativeDays(cell.fact.daysLeft) : STATE_LABELS[cell.state];

export const toCellAriaLabel = (eventTitle: string, cell: BoardCell): string =>
  `${eventTitle}, ${COLUMN_TITLES[cell.column]}: ${toCellStateLabel(cell)}, ${toCellFactLabel(cell.fact)}`;

const LEGEND_WORDS: Record<KkStepState, string> = {
  done: 'fertig',
  current: 'jetzt dran',
  overdue: 'überfällig',
  open: 'offen',
  waiting: 'warten',
  off: '',
};

export interface TallyView {
  value: string;
  caption: string;
  label: string;
  parts: KkProgressRingPart[];
  legend: KkHealthLegendEntry[];
}

export const toTallyView = (tally: StateTally): TallyView => ({
  value: String(tally.counts.done),
  caption: `von ${tally.total} Schritten erledigt`,
  label: `${tally.counts.done} von ${tally.total} Schritten erledigt`,
  parts: COUNTED_STATES.map((state) => ({ state, count: tally.counts[state] })),
  legend: COUNTED_STATES.filter((state) => state !== 'done' && tally.counts[state] > 0).map(
    (state) => ({ state, text: `${tally.counts[state]} ${LEGEND_WORDS[state]}` }),
  ),
});

export const toCountdown = (days: number): { value: string; unit: string; label: string } => {
  if (days === 0) {
    return { value: '0', unit: 'heute', label: 'Heute ist der Abend' };
  }
  if (days < 0) {
    return { value: String(-days), unit: 'her', label: `Vor ${-days} Tagen` };
  }

  return { value: String(days), unit: days === 1 ? 'Tag' : 'Tage', label: `Noch ${days} Tage` };
};

export const LATER_EYEBROW = 'Kommt noch';
export const LATER_ITEMS: readonly KkStepLaterItem[] = [
  { icon: 'stage', label: 'Besetzung' },
  { icon: 'tables', label: 'Saal & Tische' },
  { icon: 'timeline', label: 'Ablauf' },
  { icon: 'select', label: 'Aufgaben' },
  { icon: 'campaign', label: 'Werbung' },
  { icon: 'live', label: 'Live-Regie' },
];
export const IN_PREPARATION_BADGE = 'in Vorbereitung';
export const CANCELLED_BADGE = 'abgesagt';

export const toGridCount = (days: number): string => (days < 0 ? `−${-days}` : String(days));

export interface RowView {
  day: string;
  dayLabel: string;
  eyebrow: string;
  meta: string;
  count: string;
  countUnit: string;
  countLabel: string;
  countTone: 'ink' | 'quiet';
  cancelled: boolean;
  dimmed: boolean;
}

export const toRowView = (
  event: Pick<EventSummary, 'startsAt' | 'endsAt' | 'venueName' | 'isOver' | 'status'>,
  daysLeft: number,
): RowView => {
  const countdown = toCountdown(daysLeft);
  const day = toDayNumberLabel(event.startsAt);
  const dayLabel = toWeekdayEyebrow(event.startsAt);

  return {
    day,
    dayLabel,
    eyebrow: `${dayLabel} ${day}`,
    meta: toEventRowMeta(event),
    count: toGridCount(daysLeft),
    countUnit: countdown.unit,
    countLabel: countdown.label,
    countTone: event.isOver ? 'quiet' : 'ink',
    cancelled: event.status === 'cancelled',
    dimmed: event.isOver,
  };
};

const SHORT_TICKET_FACTS = {
  price: 'Preis fehlt',
  presale: 'VVK fehlt',
  places: 'VVK-Stelle fehlt',
} as const;

export const toCellShortFact = (fact: CellFact): string => {
  switch (fact.kind) {
    case 'online':
      return 'online';
    case 'publishReady':
      return 'bereit';
    case 'blocked':
      return 'offline';
    case 'neverPublished':
      return 'nie online';
    case 'factsMissing':
      return fact.details.length === 1
        ? `${toFactDetailsLabel(fact.details)} fehlt`
        : `${fact.details.length} fehlen`;
    case 'factsComplete':
      return 'komplett';
    case 'ticketFactsMissing':
      return fact.facts.length === 1
        ? SHORT_TICKET_FACTS[fact.facts[0] ?? 'price']
        : `${fact.facts.length} fehlen`;
    case 'sales':
      return fact.priceCents === null
        ? toEventStatusShortLabel({ status: fact.status, presaleStartsAt: fact.presaleStartsAt })
        : formatPriceCents(fact.priceCents);
    case 'review':
      return fact.albums > 0
        ? plural(fact.albums, 'Album', 'Alben')
        : fact.news > 0
          ? plural(fact.news, 'Meldung', 'Meldungen')
          : 'noch nichts';
    case 'reviewOpens':
      return `ab ${toShortDay(fact.opensOn)}`;
    case 'deadline':
      return toShortDay(fact.dueOn);
    case 'allDone':
      return 'erledigt';
    case 'cancelled':
      return '';
  }
};

export interface DueView {
  state: KkStepState;
  text: string;
  label: string;
}

const DUE_EYEBROW = 'Nächste Frist';

export const toDueView = (cell: BoardCell): DueView | null => {
  const { fact } = cell;

  if (fact.kind === 'allDone') {
    return { state: 'done', text: 'alles erledigt', label: `${DUE_EYEBROW}: alles erledigt` };
  }
  if (fact.kind !== 'deadline') {
    return null;
  }

  const step = STEP_TITLES[fact.step];
  const text =
    fact.daysLeft < 0
      ? `${step} · seit ${-fact.daysLeft} T`
      : cell.state === 'waiting'
        ? `${step} bis ${toShortDay(fact.dueOn)}`
        : `${step} bis ${toShortDay(fact.dueOn)} · ${toRelativeDays(fact.daysLeft)}`;

  return { state: cell.state, text, label: `${DUE_EYEBROW}: ${text}` };
};

export const ACTION_LABELS = {
  view: 'Auf der Website ansehen',
  picture: 'Bild setzen',
  editDetails: 'Angaben ergänzen',
  editTickets: 'Karten einrichten',
  album: 'Album anlegen',
} as const;

export const toStepActionLabel = (pane: EventPaneKey): string => `Weiter: ${PANE_TITLES[pane]}`;

export interface SecondaryLink {
  label: string;
  to: '/events/$eventId/edit' | '/events/$eventId/manage';
}

const EDIT_LINK: SecondaryLink = { label: 'Bearbeiten', to: '/events/$eventId/edit' };
const MANAGE_LINK: SecondaryLink = { label: EVENT_MANAGE_TITLE, to: '/events/$eventId/manage' };

export const SECONDARY_LINKS: Record<EventPaneKey, readonly SecondaryLink[]> = {
  website: [],
  details: [EDIT_LINK, MANAGE_LINK],
  tickets: [EDIT_LINK],
  review: [],
};

export const EVENT_FALLBACK_TITLE = 'Veranstaltung';
