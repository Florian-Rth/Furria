import { ACT_PAGE_PATH, GROUP_HUB_PATH } from '@/features/acts/acts-origin';
import type { ActPageSearch } from '@/features/acts/schemas';

const CALENDAR_ENTRY_PATH = '/calendar/$calendarEntryId';

export type CardLinkSearch = Record<string, string | number | boolean>;

export interface CardLink {
  to: string;
  params: Record<string, string>;
  search?: CardLinkSearch;
}

export interface ActCardLinks {
  play: CardLink;
  edit: CardLink;
  details: CardLink;
  settings: CardLink;
}

type ActPageView = NonNullable<ActPageSearch['view']>;

const ORIGIN_KEYS = ['from', 'group', 'event', 'filter', 'person', 'session'] as const;

export const originSearchOf = (search: ActPageSearch): CardLinkSearch =>
  Object.fromEntries(
    ORIGIN_KEYS.flatMap((key) => {
      const value = search[key];

      return value === undefined ? [] : [[key, value]];
    }),
  );

const actPageLinkOf = (
  actId: number,
  search: ActPageSearch,
  view: ActPageView,
  extra: CardLinkSearch,
): CardLink => ({
  to: ACT_PAGE_PATH,
  params: { actId: String(actId) },
  search: { ...originSearchOf(search), view, ...extra },
});

export const actCardLinksOf = (actId: number, search: ActPageSearch): ActCardLinks => ({
  play: actPageLinkOf(actId, search, 'play', {}),
  edit: actPageLinkOf(actId, search, 'play', { edit: true }),
  details: actPageLinkOf(actId, search, 'details', {}),
  settings: actPageLinkOf(actId, search, 'details', { settings: true }),
});

export const actCardLinkOf = (actId: number, groupId: number): CardLink => ({
  to: ACT_PAGE_PATH,
  params: { actId: String(actId) },
  search: { from: 'group', group: groupId },
});

export const calendarEntryLinkOf = (calendarEntryId: number): CardLink => ({
  to: CALENDAR_ENTRY_PATH,
  params: { calendarEntryId: String(calendarEntryId) },
});

export const groupHubLinkOf = (groupId: number): CardLink => ({
  to: GROUP_HUB_PATH,
  params: { groupId: String(groupId) },
});
