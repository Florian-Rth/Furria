import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import type { CatalogueAct } from '@/features/running-order/schemas';
import { GROUPS_TITLE, START_ORIGIN } from '@/features/session/app-sections';
import type { ActsScope } from './acts-catalogue';
import { ACTS_TITLE, GROUP_ACTS_TITLE } from './acts-copy';
import type { ActPageOrigin, ActPageSearch, ActsSearch } from './schemas';

export const CLUB_SCOPE: ActsScope = { kind: 'club' };

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

export const plannerOriginOf = (eventId: number): KkScreenOrigin => ({
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
