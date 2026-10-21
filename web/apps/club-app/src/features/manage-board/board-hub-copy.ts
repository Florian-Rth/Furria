import type { KkIconName, KkOfficeMarkState, KkScreenOrigin, KkTenureState } from '@furria/ui';
import { formatIsoDay, formatPeriod } from '@/lib/membership-labels';
import type {
  NextChange,
  PrimaryAction,
  QueueAction,
  QueueItem,
  RelativeDay,
  SeatPhase,
} from './board-hub';
import { formatMonthYear, formatQueueDay, relativeDayOf, toShortName } from './board-hub';
import { toPersonName } from './manage-board-labels';
import type { BoardFilter, BoardSeat, OfficePaneSection } from './schemas';

export const BOARD_TITLE = 'Vorstand';
export const BOARD_LEAD = 'Vorstandsfunktionen und ihre Besetzung.';
export const HUB_PATH = '/manage/board';
export const OFFICE_PATH = '/manage/board/$boardOfficeId';
export const HUB_ORIGIN: KkScreenOrigin = { label: BOARD_TITLE, to: HUB_PATH };
export const LOADING_LABEL = 'Der Vorstand wird geladen';
export const RETRY_LABEL = 'Erneut laden';
export const NEW_OFFICE_LABEL = 'Funktion';
export const NEW_OFFICE_PATH = '/manage/board/new';
export const NOT_FOUND_TITLE = 'Diese Vorstandsfunktion gibt es nicht.';

export const OPEN_TITLE = 'Offen';
export const OPEN_EMPTY = 'Nichts offen.';
export const FILTER_EMPTY = 'keine';
export const HELD_TITLE = 'Besetzt';
export const ARCHIVED_FOLD = 'Archiviert';
export const SHOW_LABEL = 'Zeigen';
export const HIDE_LABEL = 'Ausblenden';
export const ARCHIVED_LIST_ID = 'board-archived-offices';
export const QUEUE_LABEL = 'Offene Vorstandsarbeit';
export const ROSTER_LABEL = 'Besetzte Vorstandsfunktionen';
export const ARCHIVED_LABEL = 'Archivierte Vorstandsfunktionen';
export const OPEN_OFFICE_LABEL = 'Öffnen';
export const STRIP_LABEL = 'Zustand des Vorstands';
export const COUNTERS_LABEL = 'Nach Zustand filtern';
export const CLOSE_LABEL = 'Schließen';
export const OPEN_PAGE_LABEL = 'Eigene Seite öffnen';
export const NEXT_LABEL = 'Nächste Änderung';

export const toRingLabel = (held: number, active: number): string =>
  `${held} von ${active} Vorstandsfunktionen besetzt`;

export const toRingCaption = (active: number): string => `von ${active} besetzt`;

export const toNextFact = (next: NextChange): string =>
  next.kind === 'ends'
    ? `${toPersonName(next.seat)}, letzter Tag`
    : `${toPersonName(next.seat)} beginnt`;

export interface CounterView {
  id: Exclude<BoardFilter, 'all'>;
  icon: KkIconName;
  label: string;
  attention: boolean;
}

export const COUNTERS: readonly CounterView[] = [
  { id: 'vacant', icon: 'alert', label: 'unbesetzt', attention: true },
  { id: 'ending', icon: 'clock', label: 'endet', attention: true },
  { id: 'handover', icon: 'handshake', label: 'Wechsel geplant', attention: false },
  { id: 'offline', icon: 'visibilityOff', label: 'nicht auf der Website', attention: false },
];

export const toCounterAria = (label: string, count: number): string => `${count} ${label}`;

const ACTION_LABELS: Record<Exclude<QueueAction, null>, string> = {
  fill: 'Sitz eintragen',
  succeed: 'Nachfolge eintragen',
};

export const toActionLabel = (action: Exclude<QueueAction, null>): string => ACTION_LABELS[action];

const PRIMARY_LABELS: Record<PrimaryAction['kind'], string> = {
  fill: 'Sitz eintragen',
  succeed: 'Nachfolge eintragen',
  add: 'Sitz eintragen',
};

export const toPrimaryLabel = (action: PrimaryAction): string => PRIMARY_LABELS[action.kind];

const toRelativeLabel = (relative: RelativeDay): string => {
  switch (relative.kind) {
    case 'today':
      return 'heute';
    case 'tomorrow':
      return 'morgen';
    case 'ahead':
      return `in ${relative.days} Tagen`;
    case 'behind':
      return relative.days === 1 ? 'seit gestern' : `seit ${relative.days} Tagen`;
  }
};

interface QueueRowView {
  fact: string;
  day: string;
  relative: string;
  attention: boolean;
  mark: KkOfficeMarkState;
}

const NEVER_HELD_FACT = 'noch nie besetzt';

const toVacantFact = (lastSeat: BoardSeat | null): string =>
  lastSeat === null || lastSeat.untilOn === null
    ? NEVER_HELD_FACT
    : `zuletzt ${toShortName(lastSeat)}`;

export const toVacantDetail = (lastSeat: BoardSeat | null): string =>
  lastSeat === null || lastSeat.untilOn === null
    ? NEVER_HELD_FACT
    : `zuletzt ${toPersonName(lastSeat)} bis ${formatIsoDay(lastSeat.untilOn)}`;

export const toQueueRowView = (item: QueueItem, today: string): QueueRowView => {
  switch (item.kind) {
    case 'vacant':
      return {
        fact: toVacantFact(item.lastSeat),
        day: item.day === null ? '' : formatQueueDay(item.day, today),
        relative: item.day === null ? '' : toRelativeLabel(relativeDayOf(item.day, today)),
        attention: true,
        mark: 'vacant',
      };
    case 'ending':
      return {
        fact: `${toPersonName(item.seat)}, keine Nachfolge`,
        day: formatQueueDay(item.day, today),
        relative: toRelativeLabel(relativeDayOf(item.day, today)),
        attention: true,
        mark: 'attention',
      };
    case 'handover':
      return {
        fact: '',
        day: formatQueueDay(item.day, today),
        relative: toRelativeLabel(relativeDayOf(item.day, today)),
        attention: false,
        mark: 'planned',
      };
  }
};

export const INCOMING_NOTE = 'übernimmt';

export const toRosterSince = (seat: BoardSeat, compact: boolean): string => {
  if (seat.untilOn !== null) {
    return compact ? `bis ${formatMonthYear(seat.untilOn)}` : `bis ${formatIsoDay(seat.untilOn)}`;
  }

  return compact ? formatMonthYear(seat.sinceOn) : `seit ${formatIsoDay(seat.sinceOn)}`;
};

export const toArchivedSinceLabel = (archivedOn: string): string =>
  `archiviert ${formatIsoDay(archivedOn)}`;

export const PUBLIC_FLAG = 'Auf der Website';
export const OFFLINE_FLAG = 'Nicht auf der Website';
export const toRoleFlag = (roleName: string): string => `Verknüpfte Rolle: ${roleName}`;

export const toSeatPeriod = (seat: BoardSeat, phase: SeatPhase): string => {
  switch (phase) {
    case 'running':
      return `seit ${formatIsoDay(seat.sinceOn)}`;
    case 'ending':
      return `seit ${formatIsoDay(seat.sinceOn)} · bis ${formatIsoDay(seat.untilOn ?? seat.sinceOn)}`;
    case 'planned':
      return `ab ${formatIsoDay(seat.sinceOn)}`;
    case 'past':
      return formatPeriod(seat.sinceOn, seat.untilOn);
  }
};

const CHAIN_STATES: Record<SeatPhase, KkTenureState> = {
  running: 'running',
  ending: 'running',
  planned: 'planned',
  past: 'past',
};

export const toChainState = (phase: SeatPhase): KkTenureState => CHAIN_STATES[phase];

const CHAIN_STATE_LABELS: Record<KkTenureState, string> = {
  running: 'läuft',
  planned: 'geplant',
  past: 'beendet',
};

export const toChainStateLabel = (state: KkTenureState): string => CHAIN_STATE_LABELS[state];

export const toChainSpan = (seat: BoardSeat, phase: SeatPhase): string => {
  switch (phase) {
    case 'planned':
      return `ab ${formatIsoDay(seat.sinceOn)}`;
    case 'running':
      return `seit ${formatIsoDay(seat.sinceOn)}`;
    case 'ending':
    case 'past':
      return formatPeriod(seat.sinceOn, seat.untilOn);
  }
};

export interface TabView {
  id: OfficePaneSection;
  icon: KkIconName;
  label: string;
}

export const TABS: readonly TabView[] = [
  { id: 'seats', icon: 'person', label: 'Besetzung' },
  { id: 'history', icon: 'timeline', label: 'Verlauf' },
  { id: 'settings', icon: 'settings', label: 'Einstellungen' },
];

export const TABS_LABEL = 'Bereiche der Vorstandsfunktion';
export const CURRENT_TITLE = 'Aktuell';
export const PLANNED_TITLE = 'Geplant';
export const HISTORY_TITLE = 'Verlauf';
export const HISTORY_EMPTY = 'Noch kein Sitz.';
export const VACANT_NOTE = 'unbesetzt';
export const END_SEAT_LABEL = 'Beenden';
export const EDIT_OFFICE_LABEL = 'Bearbeiten';
export const EDIT_OFFICE_PATH = '/manage/board/$boardOfficeId/edit';
export const ARCHIVE_LABEL = 'Archivieren';
export const RESTORE_LABEL = 'Aktivieren';
export const WEBSITE_SWITCH = 'Auf der Website zeigen';
export const WEBSITE_LINE = 'Name, Funktion und Porträt im Vorstand der Vereinswebsite.';
export const ROLE_LABEL = 'Verknüpfte Rolle';
export const ORDER_LABEL = 'Position';
export const NO_ROLE = 'keine';
export const ARCHIVED_NOTE = 'Archiviert. Aktiviere die Funktion, um sie wieder zu besetzen.';

export const OPEN_SEAT_TITLE = 'Sitz eintragen';
export const END_SEAT_TITLE = 'Sitz beenden';
export const PICKER_NOTE = 'Auch ohne Mitgliedschaft möglich.';
export const SINCE_LABEL = 'Im Vorstand ab';
export const END_LABEL = 'Letzter Tag';
export const END_HINT = 'Dieser Tag zählt noch dazu.';
export const SUBMIT_OPEN = 'Eintragen';
export const SUBMIT_END = 'Beenden';
export const TODAY_CHOICE = 'Heute';
export const toDayChoice = (isoDay: string, today: string): string =>
  `ab ${formatQueueDay(isoDay, today)}`;
