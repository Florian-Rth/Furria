import type { StartAnnouncementAddOns, StartEntry, StartPoll, StartSignUpList } from './schemas';
import { itemKeyOf } from './start-visit';

export type OwedHost =
  | { kind: 'calendarEntry'; key: string; entry: StartEntry }
  | { kind: 'announcement'; key: string; announcement: StartAnnouncementAddOns };

export type AnnouncementOwedHost = Extract<OwedHost, { kind: 'announcement' }>;

export type OwedItem =
  | { kind: 'attendance'; key: string; isOwed: boolean; host: OwedHost }
  | { kind: 'poll'; key: string; isOwed: boolean; host: OwedHost; poll: StartPoll }
  | {
      kind: 'signUpList';
      key: string;
      isOwed: boolean;
      host: OwedHost;
      list: StartSignUpList;
    };

export interface OwedSources {
  entries: readonly StartEntry[];
  announcements: readonly StartAnnouncementAddOns[];
}

export interface OwedTally {
  owed: number;
  answered: number;
}

export interface OwedGroup {
  key: string;
  host: OwedHost;
  items: OwedItem[];
}

const ATTENDANCE_FIRST = -1;

const entryHostOf = (entry: StartEntry): OwedHost => ({
  kind: 'calendarEntry',
  key: `entry-${entry.calendarEntryId}`,
  entry,
});

const announcementHostOf = (announcement: StartAnnouncementAddOns): OwedHost => ({
  kind: 'announcement',
  key: `announcement-${announcement.announcementId}`,
  announcement,
});

const isAttendanceOwed = (entry: StartEntry): boolean =>
  entry.attendance?.isOwed === true && entry.attendance.viewerAnswer === null;

const entryAttendanceItemsOf = (entry: StartEntry): OwedItem[] => {
  if (entry.attendance === null) {
    return [];
  }

  const isOwed = isAttendanceOwed(entry);

  if (!isOwed && entry.attendance.viewerAnswer === null) {
    return [];
  }

  return [
    {
      kind: 'attendance',
      key: `attendance-${entry.calendarEntryId}`,
      isOwed,
      host: entryHostOf(entry),
    },
  ];
};

const positionOf = (item: OwedItem): number => {
  if (item.kind === 'poll') {
    return item.poll.position;
  }
  if (item.kind === 'signUpList') {
    return item.list.position;
  }
  if (item.host.kind === 'announcement') {
    return item.host.announcement.attendance?.position ?? ATTENDANCE_FIRST;
  }

  return ATTENDANCE_FIRST;
};

const byPosition = (left: OwedItem, right: OwedItem): number =>
  positionOf(left) - positionOf(right);

const functionItemsOf = (
  host: OwedHost,
  polls: readonly StartPoll[],
  lists: readonly StartSignUpList[],
): OwedItem[] => [
  ...polls.map(
    (poll): OwedItem => ({
      kind: 'poll',
      key: `poll-${poll.pollId}`,
      isOwed: poll.isOwed,
      host,
      poll,
    }),
  ),
  ...lists.map(
    (list): OwedItem => ({
      kind: 'signUpList',
      key: `sign-up-list-${list.signUpListId}`,
      isOwed: list.isOwed,
      host,
      list,
    }),
  ),
];

export const toFunctionItems = (entry: StartEntry): OwedItem[] =>
  functionItemsOf(entryHostOf(entry), entry.openPolls, entry.openSignUpLists).sort(byPosition);

const announcementItemsOf = (announcement: StartAnnouncementAddOns): OwedItem[] => {
  const host = announcementHostOf(announcement);
  const attendance: OwedItem[] =
    announcement.attendance === null
      ? []
      : [
          {
            kind: 'attendance',
            key: `announcement-attendance-${announcement.announcementId}`,
            isOwed: announcement.attendance.isOwed,
            host,
          },
        ];

  return [
    ...attendance,
    ...functionItemsOf(host, announcement.openPolls, announcement.openSignUpLists),
  ].sort(byPosition);
};

export const toAnswerItems = ({ entries, announcements }: OwedSources): OwedItem[] => [
  ...entries.flatMap((entry) => [...entryAttendanceItemsOf(entry), ...toFunctionItems(entry)]),
  ...announcements.flatMap(announcementItemsOf),
];

export const owesAnything = (entry: StartEntry): boolean =>
  toAnswerItems({ entries: [entry], announcements: [] }).some((item) => item.isOwed);

export const toOwedKeys = (sources: OwedSources): string[] =>
  toAnswerItems(sources)
    .filter((item) => item.isOwed)
    .map((item) => item.key);

export const toOwedTally = (sources: OwedSources): OwedTally => {
  const items = toAnswerItems(sources);
  const owed = items.filter((item) => item.isOwed).length;

  return { owed, answered: items.length - owed };
};

export const toOwedGroups = (items: readonly OwedItem[]): OwedGroup[] => {
  const hosts = [...new Map(items.map((item) => [item.host.key, item.host]))];

  return hosts.map(([key, host]) => ({
    key,
    host,
    items: items.filter((item) => item.host.key === key),
  }));
};

export const toHostItemKey = (host: OwedHost): string =>
  host.kind === 'calendarEntry'
    ? itemKeyOf({ panel: 'calendar', calendarEntryId: host.entry.calendarEntryId })
    : itemKeyOf({ panel: 'announcementAddOns', announcementId: host.announcement.announcementId });
