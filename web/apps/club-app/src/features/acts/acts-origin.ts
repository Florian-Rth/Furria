import type { KkLinkSearchValues } from '@furria/ui/kk-link-search';
import type { KkScreenActionLink, KkScreenOrigin } from '@furria/ui/screen-declaration';
import type { CatalogueAct } from '@/features/running-order/schemas';
import {
  EVENTS_ORIGIN,
  GROUPS_TITLE,
  MORE_ORIGIN,
  START_ORIGIN,
} from '@/features/session/app-sections';
import type { BackStackSpot } from '@/lib/back-stack';
import { actDetailsLinkOf, actDetailsPathOf } from './act-details';
import { ACT_DETAILS_LABEL } from './act-page-copy';
import { ACTS_TITLE, GROUP_ACTS_TITLE } from './acts-copy';
import type { ActPageOrigin, ActScreenSearch, ActsSearch } from './schemas';

export const PLANNER_PATH = '/events/$eventId/running-order';
export const GROUP_HUB_PATH = '/groups/$groupId';
export const GROUP_ACTS_PATH = '/groups/$groupId/acts';
export const ACTS_CATALOGUE_PATH = '/acts';
export const ACT_PAGE_PATH = '/acts/$actId';

export type ActsListState = Omit<ActsSearch, 'act'>;

export type ActPageReturn =
  | { kind: 'catalogue'; list: Record<string, string> }
  | { kind: 'groupActs'; groupId: number }
  | { kind: 'group'; groupId: number }
  | { kind: 'start' };

export const actPagePathOf = (actId: number): string =>
  ACT_PAGE_PATH.replace('$actId', String(actId));

export interface ActPageLink {
  to: string;
  search: Record<string, string | number>;
}

export const actPageLinkOf = (
  actId: number,
  search: Record<string, string | number>,
): ActPageLink => ({ to: actPagePathOf(actId), search });

const ORIGIN_KEYS: readonly string[] = ['from', 'group', 'event', 'filter', 'person', 'session'];

export const originLinkSearchOf = (previous: KkLinkSearchValues): KkLinkSearchValues =>
  Object.fromEntries(Object.entries(previous).filter(([key]) => ORIGIN_KEYS.includes(key)));

export const groupActsPathOf = (groupId: number): string =>
  GROUP_ACTS_PATH.replace('$groupId', String(groupId));

const plannerOriginOf = (eventId: number): KkScreenOrigin => ({
  label: 'Ablauf',
  to: PLANNER_PATH,
  params: { eventId: String(eventId) },
  search: { mode: 'pick' },
});

export const groupOriginOf = (groupId: number, name: string): KkScreenOrigin => ({
  label: name,
  to: GROUP_HUB_PATH,
  params: { groupId: String(groupId) },
});

export const actPageSearchOf = (
  list: ActsListState,
): ActScreenSearch & { from: ActPageOrigin } => ({
  from: 'catalogue',
  event: list.from,
  filter: list.filter,
  person: list.person,
  session: list.session,
});

const listSearchOf = (search: ActScreenSearch): Record<string, string> => {
  const kept = {
    from: search.event,
    filter: search.filter,
    person: search.person,
    session: search.session,
  };

  return Object.fromEntries(
    Object.entries(kept).flatMap(([key, value]) =>
      value === undefined ? [] : [[key, String(value)]],
    ),
  );
};

export const actPageReturnOf = (
  search: ActScreenSearch,
  act: CatalogueAct | null,
): ActPageReturn => {
  if (search.from === 'catalogue') {
    return { kind: 'catalogue', list: listSearchOf(search) };
  }

  const groupId = search.group ?? act?.group?.groupId ?? null;

  if (search.from === 'start' || groupId === null) {
    return { kind: 'start' };
  }
  if (search.from === 'groupActs') {
    return { kind: 'groupActs', groupId };
  }

  return { kind: 'group', groupId };
};

export const actPageOriginOf = (
  target: ActPageReturn,
  act: CatalogueAct | null,
): KkScreenOrigin => {
  if (target.kind === 'catalogue') {
    return { label: ACTS_TITLE, to: ACTS_CATALOGUE_PATH, search: target.list };
  }
  if (target.kind === 'groupActs') {
    return {
      label: GROUP_ACTS_TITLE,
      to: GROUP_ACTS_PATH,
      params: { groupId: String(target.groupId) },
    };
  }
  if (target.kind === 'group') {
    const name = act?.group?.groupId === target.groupId ? act.group.name : GROUPS_TITLE;

    return groupOriginOf(target.groupId, name);
  }

  return START_ORIGIN;
};

export interface ActsCatalogueAccess {
  plans: boolean;
  managesEvents: boolean;
}

export type ActsCatalogueReturn =
  | { kind: 'planner'; eventId: number }
  | { kind: 'events' }
  | { kind: 'more' }
  | { kind: 'start' };

export const actsCatalogueReturnOf = (
  from: number | undefined,
  access: ActsCatalogueAccess,
): ActsCatalogueReturn => {
  if (!access.plans) {
    return { kind: 'start' };
  }
  if (from !== undefined) {
    return { kind: 'planner', eventId: from };
  }

  return access.managesEvents ? { kind: 'events' } : { kind: 'more' };
};

export const actsCatalogueOriginOf = (target: ActsCatalogueReturn): KkScreenOrigin => {
  switch (target.kind) {
    case 'planner':
      return plannerOriginOf(target.eventId);
    case 'events':
      return EVENTS_ORIGIN;
    case 'more':
      return MORE_ORIGIN;
    case 'start':
      return START_ORIGIN;
  }
};
export const originTextSearchOf = (search: ActScreenSearch): Record<string, string> => {
  const kept = {
    from: search.from,
    group: search.group,
    event: search.event,
    filter: search.filter,
    person: search.person,
    session: search.session,
  };

  return Object.fromEntries(
    Object.entries(kept).flatMap(([key, value]) =>
      value === undefined ? [] : [[key, String(value)]],
    ),
  );
};

type ActViewBehind = 'card' | 'details' | null;

const viewBehindOf = (spot: BackStackSpot | undefined, actId: number): ActViewBehind => {
  if (spot === undefined) {
    return null;
  }
  if (spot.pathname === actPagePathOf(actId)) {
    return 'card';
  }

  const details = actDetailsPathOf(actId, null);

  return spot.pathname === details || spot.pathname.startsWith(`${details}/`) ? 'details' : null;
};

export const actCardOriginOf = (
  actId: number,
  search: ActScreenSearch,
  name: string,
): KkScreenOrigin => ({
  label: name,
  to: ACT_PAGE_PATH,
  params: { actId: String(actId) },
  search: originTextSearchOf(search),
});

export const actCardLinkOf = (actId: number, search: ActScreenSearch): KkScreenActionLink => ({
  to: ACT_PAGE_PATH,
  params: { actId: String(actId) },
  search: originTextSearchOf(search),
});

export const playerOriginOf = (
  actId: number,
  search: ActScreenSearch,
  eventId: number | null,
  behind: BackStackSpot | undefined,
  away: KkScreenOrigin,
  name: string,
): KkScreenOrigin => {
  const view = viewBehindOf(behind, actId);

  if (view === 'details') {
    return {
      label: ACT_DETAILS_LABEL,
      ...actDetailsLinkOf(actId, eventId === null ? null : { kind: 'evening', eventId }),
      search: originTextSearchOf(search),
    };
  }

  return view === 'card' ? actCardOriginOf(actId, search, name) : away;
};
