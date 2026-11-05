import { useMeQuery } from '@/features/session/api';
import type { PersonRef } from '@/lib/api/schemas';

export type Myself = { kind: 'loading' } | { kind: 'known'; person: PersonRef | null };

export const useMyself = (): Myself => {
  const me = useMeQuery().data;

  if (me === undefined) {
    return { kind: 'loading' };
  }

  const person =
    me.person === null
      ? null
      : { personId: me.person.id, firstName: me.person.firstName, lastName: me.person.lastName };

  return { kind: 'known', person };
};
