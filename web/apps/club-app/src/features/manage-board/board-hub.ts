import type { WriteLanding } from '@/features/write';
import { fromIsoDay, toIsoDay } from '@/lib/day';
import type { BoardFilter, BoardOffice, BoardSeat } from './schemas';

const DAY_MS = 86_400_000;

const shiftDay = (isoDay: string, days: number): string => {
  const date = fromIsoDay(isoDay);
  date.setDate(date.getDate() + days);

  return toIsoDay(date);
};

export const daysBetween = (fromDay: string, toDay: string): number =>
  Math.round((Date.parse(`${toDay}T00:00:00Z`) - Date.parse(`${fromDay}T00:00:00Z`)) / DAY_MS);

const isRunningOn = (seat: BoardSeat, today: string): boolean =>
  seat.sinceOn <= today && (seat.untilOn === null || seat.untilOn >= today);

const isUpcomingOn = (seat: BoardSeat, today: string): boolean => seat.sinceOn > today;

export const lastSeatOf = (pastSeats: readonly BoardSeat[]): BoardSeat | null =>
  pastSeats.reduce<BoardSeat | null>(
    (latest, seat) =>
      seat.untilOn !== null && (latest === null || seat.untilOn > (latest.untilOn ?? ''))
        ? seat
        : latest,
    null,
  );

export const vacantSinceOf = (pastSeats: readonly BoardSeat[]): string | null => {
  const end = lastSeatOf(pastSeats)?.untilOn ?? null;

  return end === null ? null : shiftDay(end, 1);
};

export type QueueItem =
  | {
      kind: 'vacant';
      key: string;
      boardOfficeId: number;
      day: string | null;
      lastSeat: BoardSeat | null;
    }
  | { kind: 'ending'; key: string; boardOfficeId: number; seat: BoardSeat; day: string }
  | {
      kind: 'handover';
      key: string;
      boardOfficeId: number;
      outgoing: BoardSeat | null;
      incoming: BoardSeat;
      day: string;
    };

type QueueKind = QueueItem['kind'];

const outgoingFor = (incoming: BoardSeat, endingSeats: readonly BoardSeat[]): BoardSeat | null =>
  endingSeats
    .filter((seat) => seat.untilOn !== null && seat.untilOn < incoming.sinceOn)
    .reduce<BoardSeat | null>(
      (closest, seat) =>
        closest === null || (seat.untilOn ?? '') > (closest.untilOn ?? '') ? seat : closest,
      null,
    );

const upcomingOf = (office: BoardOffice, today: string): BoardSeat[] =>
  office.seats
    .filter((seat) => isUpcomingOn(seat, today))
    .sort((left, right) => left.sinceOn.localeCompare(right.sinceOn));

const officeItems = (office: BoardOffice, today: string): QueueItem[] => {
  const running = office.seats.filter((seat) => isRunningOn(seat, today));
  const upcoming = upcomingOf(office, today);
  const ending = running.filter((seat) => seat.untilOn !== null);
  const handovers: QueueItem[] = upcoming.map((incoming) => ({
    kind: 'handover',
    key: `handover-${incoming.boardSeatId}`,
    boardOfficeId: office.boardOfficeId,
    outgoing: outgoingFor(incoming, ending),
    incoming,
    day: incoming.sinceOn,
  }));
  const handedOver = new Set(
    handovers.flatMap((item) =>
      item.kind === 'handover' && item.outgoing !== null ? [item.outgoing.boardSeatId] : [],
    ),
  );
  const endings: QueueItem[] = ending
    .filter((seat) => !handedOver.has(seat.boardSeatId))
    .map((seat) => ({
      kind: 'ending',
      key: `ending-${seat.boardSeatId}`,
      boardOfficeId: office.boardOfficeId,
      seat,
      day: seat.untilOn ?? today,
    }));
  const vacancy: QueueItem[] =
    running.length === 0 && upcoming.length === 0
      ? [
          {
            kind: 'vacant',
            key: `vacant-${office.boardOfficeId}`,
            boardOfficeId: office.boardOfficeId,
            day: vacantSinceOf(office.pastSeats),
            lastSeat: lastSeatOf(office.pastSeats),
          },
        ]
      : [];

  return [...vacancy, ...endings, ...handovers];
};

const KIND_RANK: Record<QueueKind, number> = { vacant: 0, ending: 1, handover: 1 };

const NEVER = '0000-00-00';

const inQueueOrder = (left: QueueItem, right: QueueItem): number => {
  if (KIND_RANK[left.kind] !== KIND_RANK[right.kind]) {
    return KIND_RANK[left.kind] - KIND_RANK[right.kind];
  }

  return (left.day ?? NEVER).localeCompare(right.day ?? NEVER);
};

export const toQueueItems = (offices: readonly BoardOffice[], today: string): QueueItem[] =>
  offices
    .filter((office) => office.archivedOn === null)
    .flatMap((office) => officeItems(office, today))
    .sort(inQueueOrder);

export interface QueueCounts {
  vacant: number;
  handover: number;
  ending: number;
  offline: number;
}

export const toQueueCounts = (
  items: readonly QueueItem[],
  offices: readonly BoardOffice[],
): QueueCounts => ({
  vacant: items.filter((item) => item.kind === 'vacant').length,
  handover: items.filter((item) => item.kind === 'handover').length,
  ending: items.filter((item) => item.kind === 'ending').length,
  offline: offices.filter((office) => office.archivedOn === null && !office.isPublic).length,
});

const isOfflineOffice = (offices: readonly BoardOffice[], boardOfficeId: number): boolean =>
  offices.some((office) => office.boardOfficeId === boardOfficeId && !office.isPublic);

export const filterQueue = (
  items: readonly QueueItem[],
  offices: readonly BoardOffice[],
  filter: BoardFilter,
): QueueItem[] => {
  switch (filter) {
    case 'all':
      return [...items];
    case 'offline':
      return items.filter((item) => isOfflineOffice(offices, item.boardOfficeId));
    case 'vacant':
    case 'handover':
    case 'ending':
      return items.filter((item) => item.kind === filter);
  }
};

const inBoardOrder = (left: BoardOffice, right: BoardOffice): number =>
  left.sortOrder !== right.sortOrder
    ? left.sortOrder - right.sortOrder
    : left.name.localeCompare(right.name, 'de');

export const toHeldOffices = (
  offices: readonly BoardOffice[],
  items: readonly QueueItem[],
  filter: BoardFilter,
  today: string,
): BoardOffice[] => {
  const held = offices.filter(
    (office) => office.archivedOn === null && office.seats.some((seat) => isRunningOn(seat, today)),
  );
  const flagged = new Set(
    items.filter((item) => item.kind === filter).map((item) => item.boardOfficeId),
  );
  const shown =
    filter === 'all'
      ? held
      : filter === 'offline'
        ? held.filter((office) => !office.isPublic)
        : held.filter((office) => flagged.has(office.boardOfficeId));

  return shown.sort(inBoardOrder);
};

export const toArchivedOffices = (offices: readonly BoardOffice[]): BoardOffice[] =>
  offices.filter((office) => office.archivedOn !== null).sort(inBoardOrder);

export const toRunningSeats = (office: BoardOffice, today: string): BoardSeat[] =>
  office.seats
    .filter((seat) => isRunningOn(seat, today))
    .sort((left, right) => left.sinceOn.localeCompare(right.sinceOn));

export const isOfficeVacant = (office: BoardOffice, today: string): boolean =>
  office.archivedOn === null && toRunningSeats(office, today).length === 0;

export type OfficeMarkState = 'held' | 'vacant' | 'archived';

export const toOfficeMarkState = (office: BoardOffice, isVacant: boolean): OfficeMarkState => {
  if (office.archivedOn !== null) {
    return 'archived';
  }

  return isVacant ? 'vacant' : 'held';
};

export const canSeatOffice = (office: BoardOffice, canManageRoles: boolean): boolean =>
  office.archivedOn === null && (office.impliedRoleId === null || canManageRoles);

export const firstDayAfter = (item: QueueItem, today: string): string =>
  item.kind === 'ending' ? shiftDay(item.day, 1) : today;

export type SeatPhase = 'running' | 'ending' | 'planned' | 'past';

export const seatPhaseOf = (seat: BoardSeat, today: string): SeatPhase => {
  if (seat.untilOn !== null && seat.untilOn < today) {
    return 'past';
  }
  if (seat.sinceOn > today) {
    return 'planned';
  }

  return seat.untilOn === null ? 'running' : 'ending';
};

export interface OfficeSeatGroups {
  current: BoardSeat[];
  planned: BoardSeat[];
}

export const toOfficeSeatGroups = (office: BoardOffice, today: string): OfficeSeatGroups => ({
  current: toRunningSeats(office, today),
  planned: upcomingOf(office, today),
});

export const toSeatChain = (office: BoardOffice): BoardSeat[] =>
  [...office.seats, ...office.pastSeats].sort((left, right) =>
    right.sinceOn.localeCompare(left.sinceOn),
  );

export type PrimaryAction =
  | { kind: 'fill'; sinceOn: string }
  | { kind: 'succeed'; sinceOn: string }
  | { kind: 'add'; sinceOn: string };

export const primaryActionOf = (
  office: BoardOffice,
  today: string,
  canSeat: boolean,
): PrimaryAction | null => {
  if (!canSeat) {
    return null;
  }

  const [item] = officeItems(office, today).filter(
    (candidate) => candidate.kind === 'vacant' || candidate.kind === 'ending',
  );

  if (item?.kind === 'vacant') {
    return { kind: 'fill', sinceOn: today };
  }
  if (item?.kind === 'ending') {
    return { kind: 'succeed', sinceOn: firstDayAfter(item, today) };
  }

  return { kind: 'add', sinceOn: today };
};

type ChangeKind = 'ends' | 'starts';

export interface NextChange {
  kind: ChangeKind;
  day: string;
  seat: BoardSeat;
}

const changesOf = (office: BoardOffice, today: string): NextChange[] =>
  office.seats.flatMap((seat): NextChange[] => {
    if (isUpcomingOn(seat, today)) {
      return [{ kind: 'starts', day: seat.sinceOn, seat }];
    }
    if (seat.untilOn !== null) {
      return [{ kind: 'ends', day: seat.untilOn, seat }];
    }

    return [];
  });

const earlier = (best: NextChange | null, change: NextChange): NextChange => {
  if (best === null || change.day < best.day) {
    return change;
  }
  if (change.day === best.day && change.kind === 'ends' && best.kind === 'starts') {
    return change;
  }

  return best;
};

export interface BoardSummary {
  held: number;
  active: number;
  next: NextChange | null;
}

export const toBoardSummary = (offices: readonly BoardOffice[], today: string): BoardSummary => {
  const active = offices.filter((office) => office.archivedOn === null);

  return {
    held: active.filter((office) => office.seats.some((seat) => isRunningOn(seat, today))).length,
    active: active.length,
    next: active
      .flatMap((office) => changesOf(office, today))
      .reduce<NextChange | null>(earlier, null),
  };
};

export const formatQueueDay = (isoDay: string, today: string): string => {
  const day = `${isoDay.slice(8, 10)}.${isoDay.slice(5, 7)}.`;

  return isoDay.slice(0, 4) === today.slice(0, 4) ? day : `${day}${isoDay.slice(0, 4)}`;
};

export const formatMonthYear = (isoDay: string): string =>
  `${isoDay.slice(5, 7)}/${isoDay.slice(0, 4)}`;

export type RelativeDay =
  | { kind: 'today' }
  | { kind: 'tomorrow' }
  | { kind: 'ahead'; days: number }
  | { kind: 'behind'; days: number };

export const relativeDayOf = (isoDay: string, today: string): RelativeDay => {
  const delta = daysBetween(today, isoDay);

  if (delta === 0) {
    return { kind: 'today' };
  }
  if (delta === 1) {
    return { kind: 'tomorrow' };
  }

  return delta > 0 ? { kind: 'ahead', days: delta } : { kind: 'behind', days: -delta };
};

export type QueueAction = 'fill' | 'succeed' | null;

export const queueActionOf = (item: QueueItem, canSeat: boolean): QueueAction => {
  if (!canSeat) {
    return null;
  }

  switch (item.kind) {
    case 'vacant':
      return 'fill';
    case 'ending':
      return 'succeed';
    case 'handover':
      return null;
  }
};

export const toShortName = (person: { firstName: string; lastName: string }): string => {
  const initial = person.firstName.trim().charAt(0);

  return initial === '' ? person.lastName : `${initial}. ${person.lastName}`;
};

export const OFFICE_LANDING_KIND = 'board-office';

export type EditorReturn = 'new' | 'hub' | 'office';

export const toEditorLanding = (boardOfficeId: number, returnTo: EditorReturn): WriteLanding => {
  const mark = { kind: OFFICE_LANDING_KIND, id: boardOfficeId };

  switch (returnTo) {
    case 'office':
      return { to: '/manage/board/$boardOfficeId', params: { boardOfficeId } };
    case 'hub':
      return { to: '/manage/board', search: { office: boardOfficeId }, mark };
    case 'new':
      return { to: '/manage/board', mark };
  }
};
