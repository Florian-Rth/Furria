import { actScreenLinkOf } from '@/features/acts/act-screens';
import { ACT_PAGE_PATH, GROUP_HUB_PATH } from '@/features/acts/acts-origin';
import type { ActScreenSearch } from '@/features/acts/schemas';

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

const DETAILS_VIEW = 'details';

const ORIGIN_KEYS = ['from', 'group', 'event', 'filter', 'person', 'session'] as const;

export const originSearchOf = (search: ActScreenSearch): CardLinkSearch =>
  Object.fromEntries(
    ORIGIN_KEYS.flatMap((key) => {
      const value = search[key];

      return value === undefined ? [] : [[key, value]];
    }),
  );

const detailsLinkOf = (
  actId: number,
  search: ActScreenSearch,
  extra: CardLinkSearch,
): CardLink => ({
  to: ACT_PAGE_PATH,
  params: { actId: String(actId) },
  search: { ...originSearchOf(search), view: DETAILS_VIEW, ...extra },
});

export const actCardLinksOf = (actId: number, search: ActScreenSearch): ActCardLinks => ({
  play: {
    ...actScreenLinkOf(actId, { kind: 'practice', eventId: null }),
    search: originSearchOf(search),
  },
  edit: {
    ...actScreenLinkOf(actId, { kind: 'edit', eventId: null }),
    search: originSearchOf(search),
  },
  details: detailsLinkOf(actId, search, {}),
  settings: detailsLinkOf(actId, search, { settings: true }),
});

export const actCardLinkOf = (actId: number, groupId: number): CardLink => ({
  to: ACT_PAGE_PATH,
  params: { actId: String(actId) },
  search: { from: 'group', group: groupId },
});

export const groupHubLinkOf = (groupId: number): CardLink => ({
  to: GROUP_HUB_PATH,
  params: { groupId: String(groupId) },
});
