import { useMeQuery } from '@/features/session';

export const useIsSelf = (personId: number | null): boolean | undefined => {
  const me = useMeQuery();

  if (me.data === undefined) {
    return undefined;
  }

  return personId !== null && personId === me.data.person.id;
};
