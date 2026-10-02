import { usePublicClubQuery } from './api';

export const useClubEmail = (): string | null => {
  const { data } = usePublicClubQuery();

  return data?.email ?? null;
};
