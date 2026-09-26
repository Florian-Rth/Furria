import { useMeQuery } from '@/features/session';
import type { AccessActions } from '../access-actions';
import { accessActionsOf } from '../access-actions';
import type { AccessSubject } from '../types';

export const useAccessActions = (subject: AccessSubject): AccessActions => {
  const me = useMeQuery();

  return accessActionsOf({
    access: subject.access,
    email: subject.email,
    isOwnAccount: me.data?.person.id === subject.personId,
  });
};
