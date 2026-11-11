import type { KkStepState } from '@furria/ui/step-state';
import type { FactDetail } from './event-plan';
import type { EventStepKey } from './schemas';

export const STEP_TITLES: Record<EventStepKey, string> = {
  details: 'Eckdaten',
  tickets: 'Karten',
  runningOrder: 'Ablauf',
  hall: 'Saal & Tische',
};

const FACT_DETAIL_NAMES: Record<FactDetail, string> = {
  venue: 'Ort',
  doorsOpenAt: 'Einlass',
  description: 'Beschreibung',
  picture: 'Bild',
};

const LIST_SEPARATOR = ', ';

export const toFactDetailsLabel = (details: readonly FactDetail[]): string =>
  details.map((detail) => FACT_DETAIL_NAMES[detail]).join(LIST_SEPARATOR);

export const toShortDay = (isoDay: string): string =>
  `${isoDay.slice(8, 10)}.${isoDay.slice(5, 7)}.`;

const daysLabel = (days: number): string => (days === 1 ? '1 Tag' : `${days} Tage`);

export interface DueCopy {
  state: KkStepState;
  dueOn: string;
  opensOn: string | null;
}

export const toDueLabel = ({ state, dueOn, opensOn }: DueCopy, daysLeft: number): string => {
  switch (state) {
    case 'done':
      return 'erledigt';
    case 'overdue':
      return `überfällig seit ${toShortDay(dueOn)}`;
    case 'waiting':
      return opensOn === null
        ? `fällig ${toShortDay(dueOn)}`
        : `ab ${toShortDay(opensOn)} · fällig ${toShortDay(dueOn)}`;
    case 'current':
    case 'open':
    case 'off':
      return daysLeft > 0
        ? `fällig ${toShortDay(dueOn)} · noch ${daysLabel(daysLeft)}`
        : `fällig ${toShortDay(dueOn)}`;
  }
};
