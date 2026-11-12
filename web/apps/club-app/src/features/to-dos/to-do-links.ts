import type { KkLinkSearchValues } from '@furria/ui/kk-link-search';
import type { FileRouteTypes } from '@/routeTree.gen';
import type { ToDoKind } from './schemas';

export interface ToDoLink {
  to: FileRouteTypes['to'];
  params: Record<string, string>;
  search: KkLinkSearchValues;
}

export interface ToDoTarget {
  kind: ToDoKind;
  group: { groupId: number } | null;
}

type ClubToDoKind = Exclude<ToDoKind, 'groupMatcherStatementsOpen'>;

const NO_PARAMS: Record<string, string> = {};

const CLUB_TO_DO_LINKS: Record<ClubToDoKind, ToDoLink> = {
  neverInvited: { to: '/manage', params: NO_PARAMS, search: { changed: 'access' } },
  reminderDue: { to: '/manage', params: NO_PARAMS, search: { changed: 'access' } },
  inPersonOnly: {
    to: '/manage/persons',
    params: NO_PARAMS,
    search: { access: 'without-email' },
  },
  birthDateUnknown: {
    to: '/manage/persons',
    params: NO_PARAMS,
    search: { access: 'birth-date-unknown' },
  },
  keyToTakeBack: { to: '/manage/keys', params: NO_PARAMS, search: {} },
  clubRecordGap: { to: '/manage/club-record', params: NO_PARAMS, search: {} },
  applicationWaiting: { to: '/manage/applications', params: NO_PARAMS, search: {} },
};

const GROUPS_LINK: ToDoLink = { to: '/groups', params: NO_PARAMS, search: {} };

export const toToDoLink = ({ kind, group }: ToDoTarget): ToDoLink => {
  if (kind !== 'groupMatcherStatementsOpen') {
    return CLUB_TO_DO_LINKS[kind];
  }

  return group === null
    ? GROUPS_LINK
    : {
        to: '/groups/$groupId/group-matcher',
        params: { groupId: String(group.groupId) },
        search: {},
      };
};
