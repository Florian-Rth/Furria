import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import type { CatalogueAct } from '@/features/running-order/schemas';
import {
  EVENTS_ORIGIN,
  GROUPS_TITLE,
  MORE_ORIGIN,
  START_ORIGIN,
} from '@/features/session/app-sections';
import type { BackStackSpot } from '@/lib/back-stack';
import { DETAILS_LABEL } from './act-page-copy';
import type { ActsScope } from './acts-catalogue';
import { ACTS_TITLE, GROUP_ACTS_TITLE } from './acts-copy';
import type { ActPageOrigin, ActPageSearch, ActsSearch } from './schemas';

export const CLUB_SCOPE: ActsScope = { kind: 'club' };

const DETAILS_VIEW = 'details';

export const PLANNER_PATH = '/events/$eventId/ablauf';
export const GROUP_HUB_PATH = '/groups/$groupId';
export const GROUP_ACTS_PATH = '/groups/$groupId/acts';
export const ACTS_CATALOGUE_PATH = '/acts';
export const ACT_PAGE_PATH = '/acts/$actId';

export type ActsListState = Omit<ActsSearch, 'act'>;

export type ActPageReturn =
  | { kind: 'catalogue'; list: Record<string, string> }
  | { kind: 'groupActs'; groupId: number; list: Record<string, string> }
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
  scope: ActsScope,
  list: ActsListState,
): ActPageSearch & { from: ActPageOrigin } => ({
  from: scope.kind === 'club' ? 'catalogue' : 'groupActs',
  group: scope.kind === 'group' ? scope.groupId : undefined,
  event: list.from,
  filter: list.filter,
  person: list.person,
  session: list.session,
});

const listSearchOf = (search: ActPageSearch): Record<string, string> => {
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

export const actPageReturnOf = (search: ActPageSearch, act: CatalogueAct | null): ActPageReturn => {
  if (search.from === 'catalogue') {
    return { kind: 'catalogue', list: listSearchOf(search) };
  }

  const groupId = search.group ?? act?.group?.groupId ?? null;

  if (search.from === 'start' || groupId === null) {
    return { kind: 'start' };
  }
  if (search.from === 'groupActs') {
    return { kind: 'groupActs', groupId, list: listSearchOf(search) };
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
      search: target.list,
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
const detailsSearchOf = (search: ActPageSearch): Record<string, string> => {
  const details = { ...search, view: DETAILS_VIEW, edit: undefined, training: undefined };

  return Object.fromEntries(
    Object.entries(details).flatMap(([key, value]) =>
      value === undefined ? [] : [[key, String(value)]],
    ),
  );
};

const isActDetails = (spot: BackStackSpot | undefined, actId: number): boolean =>
  spot !== undefined &&
  spot.pathname === actPagePathOf(actId) &&
  new URLSearchParams(spot.search).get('view') === DETAILS_VIEW;

export const playerOriginOf = (
  actId: number,
  search: ActPageSearch,
  behind: BackStackSpot | undefined,
  away: KkScreenOrigin,
): KkScreenOrigin =>
  isActDetails(behind, actId)
    ? {
        label: DETAILS_LABEL,
        to: ACT_PAGE_PATH,
        params: { actId: String(actId) },
        search: detailsSearchOf(search),
      }
    : away;
