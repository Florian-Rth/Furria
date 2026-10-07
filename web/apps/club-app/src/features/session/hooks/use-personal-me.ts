import type { PersonalMe } from '@/lib/api/schemas';
import { useMeQuery } from '../api';
import { isPersonalMe } from '../personal-me';

export interface PersonalMeQuery {
  data: PersonalMe | undefined;
  error: Error | null;
  refetch: () => void;
}

export const usePersonalMe = (): PersonalMeQuery => {
  const me = useMeQuery();
  const data = me.data !== undefined && isPersonalMe(me.data) ? me.data : undefined;

  const refetch = (): void => {
    void me.refetch();
  };

  return { data, error: me.error, refetch };
};
