import type { KkLinkSearchValues } from '@furria/ui';
import type { FileRouteTypes } from '@/routeTree.gen';
import type { ToDoKind } from './schemas';

export interface ToDoLink {
  to: FileRouteTypes['to'];
  search: KkLinkSearchValues;
}

export const TO_DO_LINKS: Record<ToDoKind, ToDoLink> = {
  neverInvited: { to: '/manage', search: { changed: 'access' } },
  reminderDue: { to: '/manage', search: { changed: 'access' } },
  inPersonOnly: { to: '/manage/persons', search: { access: 'without-email' } },
  birthDateUnknown: { to: '/manage/persons', search: { access: 'birth-date-unknown' } },
  keyToTakeBack: { to: '/manage/keys', search: {} },
  clubRecordGap: { to: '/manage/club-record', search: {} },
};
