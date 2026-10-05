import { toPeekedId } from '@/lib/peek';
import type {
  Start,
  StartAnnouncement,
  StartEntry,
  StartGroupMoment,
  StartMine,
  StartPanel,
  StartPanelKind,
} from './schemas';

export const START_CALENDAR_SHEET = 'start-calendar';
export const START_ANNOUNCEMENTS_SHEET = 'start-announcements';
export const START_MINE_SHEET = 'start-mine';
export const START_GROUPS_SHEET = 'start-groups';

export type StartSheet =
  | { kind: 'entry'; calendarEntryId: number }
  | { kind: 'calendar' }
  | { kind: 'announcements'; announcementId: number | null }
  | { kind: 'role'; roleId: number }
  | { kind: 'office'; boardOfficeId: number }
  | { kind: 'mine' }
  | { kind: 'groups' }
  | { kind: 'foreign' };

const FIXED_SHEETS: Readonly<Record<string, StartSheet>> = {
  [START_CALENDAR_SHEET]: { kind: 'calendar' },
  [START_ANNOUNCEMENTS_SHEET]: { kind: 'announcements', announcementId: null },
  [START_MINE_SHEET]: { kind: 'mine' },
  [START_GROUPS_SHEET]: { kind: 'groups' },
};

const FOREIGN: StartSheet = { kind: 'foreign' };

type PanelOf<TKind extends StartPanelKind> = Extract<StartPanel, { kind: TKind }>;

const panelOf = <TKind extends StartPanelKind>(
  start: Start,
  kind: TKind,
): PanelOf<TKind> | undefined =>
  start.panels.find((panel): panel is PanelOf<TKind> => panel.kind === kind);

export const parseStartSheet = (sheetId: string | null): StartSheet | null => {
  if (sheetId === null) {
    return null;
  }

  const fixed = FIXED_SHEETS[sheetId];

  if (fixed !== undefined) {
    return fixed;
  }

  const calendarEntryId = toPeekedId(sheetId, 'entry');

  if (calendarEntryId !== null) {
    return { kind: 'entry', calendarEntryId };
  }

  const announcementId = toPeekedId(sheetId, 'start-announcements');

  if (announcementId !== null) {
    return { kind: 'announcements', announcementId };
  }

  const roleId = toPeekedId(sheetId, 'role');

  if (roleId !== null) {
    return { kind: 'role', roleId };
  }

  const boardOfficeId = toPeekedId(sheetId, 'office');

  return boardOfficeId === null ? FOREIGN : { kind: 'office', boardOfficeId };
};

export const entriesOf = (start: Start): StartEntry[] => panelOf(start, 'calendar')?.entries ?? [];

export const announcementsOf = (start: Start): StartAnnouncement[] =>
  panelOf(start, 'announcements')?.announcements ?? [];

export const mineOf = (start: Start): StartMine[] => panelOf(start, 'mine')?.mine ?? [];

export const groupMomentsOf = (start: Start): StartGroupMoment[] =>
  panelOf(start, 'groups')?.groupMoments ?? [];

const hasMine = (start: Start, kind: StartMine['kind'], subjectId: number): boolean =>
  mineOf(start).some((mine) => mine.kind === kind && mine.subjectId === subjectId);

const opensOn = (sheet: StartSheet, start: Start): boolean => {
  if (sheet.kind === 'entry') {
    return entriesOf(start).some((entry) => entry.calendarEntryId === sheet.calendarEntryId);
  }
  if (sheet.kind === 'calendar') {
    return entriesOf(start).length > 0;
  }
  if (sheet.kind === 'announcements') {
    const announcements = announcementsOf(start);

    return sheet.announcementId === null
      ? announcements.length > 0
      : announcements.some((announcement) => announcement.announcementId === sheet.announcementId);
  }
  if (sheet.kind === 'role') {
    return hasMine(start, 'newRole', sheet.roleId);
  }
  if (sheet.kind === 'office') {
    return hasMine(start, 'newBoardSeat', sheet.boardOfficeId);
  }
  if (sheet.kind === 'mine') {
    return mineOf(start).length > 0;
  }
  if (sheet.kind === 'groups') {
    return groupMomentsOf(start).length > 0;
  }

  return false;
};

export const isStrayStartSheet = (sheetId: string | null, start: Start): boolean => {
  const sheet = parseStartSheet(sheetId);

  return sheet !== null && !opensOn(sheet, start);
};

export const isAnnouncementsSheet = (sheetId: string | null): boolean =>
  parseStartSheet(sheetId)?.kind === 'announcements';

export const focusedAnnouncementOf = (sheetId: string | null): number | null => {
  const sheet = parseStartSheet(sheetId);

  return sheet?.kind === 'announcements' ? sheet.announcementId : null;
};

export const newestFirst = (announcements: readonly StartAnnouncement[]): StartAnnouncement[] =>
  [...announcements].sort(
    (first, second) =>
      Date.parse(second.publishedAt) - Date.parse(first.publishedAt) ||
      second.announcementId - first.announcementId,
  );
