import type { KkStepState } from '@furria/ui';
import type { FactDetail } from './event-plan';
import type { EventStepKey } from './schemas';

export const STEP_TITLES: Record<EventStepKey, string> = {
  details: 'Eckdaten',
  tickets: 'Karten',
  review: 'Nachbereitung',
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

const daysLabel = (days: number): string => (days === 1 ? '1 Tag' : `${days} Tagen`);

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

export const LATER_STEPS: readonly { title: string; line: string }[] = [
  {
    title: 'Besetzung',
    line: 'Wer an dem Abend auf der Bühne steht — Gruppen, Redner und Gastvereine, mit Zu- und Absagen.',
  },
  {
    title: 'Saal & Tische',
    line: 'Der Saal mit Tischreihen, Stühlen und Bereichen — gezeichnet am Rechner, nachgeschlagen am Handy.',
  },
  {
    title: 'Ablauf',
    line: 'Die Reihenfolge der Auftritte mit Uhrzeiten, Umziehzeiten und Pause.',
  },
  {
    title: 'Aufgaben',
    line: 'Die Liste, was vor dem Abend zu tun ist, je Amt verteilt — vom Sanitätsdienst bis zu den Orden.',
  },
  {
    title: 'Werbung',
    line: 'Beitrag, Story und Plakat für den Abend, gebaut aus Bild und Eckdaten.',
  },
  {
    title: 'Live-Regie',
    line: 'Am Abend selbst den Ablauf weiterschalten — alle sehen, wer gerade auf der Bühne steht.',
  },
];

export const LATER_SHEET_ID = 'event-later';
export const LATER_SHEET_TITLE = 'Kommt noch';
export const SHEET_CLOSE_LABEL = 'Schließen';
