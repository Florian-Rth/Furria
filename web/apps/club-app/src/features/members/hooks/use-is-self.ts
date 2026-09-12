import { useMeQuery } from '@/features/session';

export const useIsSelf = (personId: number | null): boolean => {
  const me = useMeQuery();
  const viewerPersonId = me.data?.person.id;

  return personId !== null && personId === viewerPersonId;
};
