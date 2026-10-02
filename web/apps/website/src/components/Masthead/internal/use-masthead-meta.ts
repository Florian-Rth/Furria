import { usePublicClubQuery } from '@/lib/public-club/api';
import { buildFoundingLabel, buildSessionLabel } from './masthead-meta';

interface MastheadMeta {
  foundingLabel: string;
  sessionLabel: string;
}

export const useMastheadMeta = (): MastheadMeta => {
  const { data } = usePublicClubQuery();

  return {
    foundingLabel: buildFoundingLabel(data?.foundedYear ?? null),
    sessionLabel: buildSessionLabel(data?.session.label ?? null),
  };
};
