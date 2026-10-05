import { usePublicClubQuery } from './api';

export const useClubAgeOfConsent = (): number | null => {
  const { data } = usePublicClubQuery();

  return data?.ageOfConsent ?? null;
};
