import type { StartEntry, StartPoll, StartSignUpList } from './schemas';

export type OwedItem =
  | { kind: 'attendance'; key: string; isOwed: boolean; entry: StartEntry }
  | { kind: 'poll'; key: string; isOwed: boolean; entry: StartEntry; poll: StartPoll }
  | {
      kind: 'signUpList';
      key: string;
      isOwed: boolean;
      entry: StartEntry;
      list: StartSignUpList;
    };

export interface OwedTally {
  owed: number;
  answered: number;
}

const isAttendanceOwed = (entry: StartEntry): boolean =>
  entry.attendance?.isOwed === true && entry.attendance.viewerAnswer === null;

const attendanceItemsOf = (entry: StartEntry): OwedItem[] => {
  if (entry.attendance === null) {
    return [];
  }

  const isOwed = isAttendanceOwed(entry);

  if (!isOwed && entry.attendance.viewerAnswer === null) {
    return [];
  }

  return [{ kind: 'attendance', key: `attendance-${entry.calendarEntryId}`, isOwed, entry }];
};

const positionOf = (item: OwedItem): number => {
  if (item.kind === 'poll') {
    return item.poll.position;
  }
  if (item.kind === 'signUpList') {
    return item.list.position;
  }

  return -1;
};

export const toFunctionItems = (entry: StartEntry): OwedItem[] => {
  const polls = entry.openPolls.map(
    (poll): OwedItem => ({
      kind: 'poll',
      key: `poll-${poll.pollId}`,
      isOwed: poll.isOwed,
      entry,
      poll,
    }),
  );
  const lists = entry.openSignUpLists.map(
    (list): OwedItem => ({
      kind: 'signUpList',
      key: `sign-up-list-${list.signUpListId}`,
      isOwed: list.isOwed,
      entry,
      list,
    }),
  );

  return [...polls, ...lists].sort((left, right) => positionOf(left) - positionOf(right));
};

export const toAnswerItems = (entries: readonly StartEntry[]): OwedItem[] =>
  entries.flatMap((entry) => [...attendanceItemsOf(entry), ...toFunctionItems(entry)]);

export const owesAnything = (entry: StartEntry): boolean =>
  toAnswerItems([entry]).some((item) => item.isOwed);

export const toOwedKeys = (entries: readonly StartEntry[]): string[] =>
  toAnswerItems(entries)
    .filter((item) => item.isOwed)
    .map((item) => item.key);

export const toOwedTally = (entries: readonly StartEntry[]): OwedTally => {
  const items = toAnswerItems(entries);
  const owed = items.filter((item) => item.isOwed).length;

  return { owed, answered: items.length - owed };
};

export interface OwedGroup {
  key: number;
  entry: StartEntry;
  items: OwedItem[];
}

export const toOwedGroups = (items: readonly OwedItem[]): OwedGroup[] => {
  const entries = [...new Map(items.map((item) => [item.entry.calendarEntryId, item.entry]))];

  return entries.map(([key, entry]) => ({
    key,
    entry,
    items: items.filter((item) => item.entry.calendarEntryId === key),
  }));
};
