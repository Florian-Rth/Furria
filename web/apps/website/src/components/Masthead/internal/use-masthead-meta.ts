import { publicClub } from '@/lib/public-club/api';
import { readySourceData } from '@/lib/public-resource/public-source';
import { buildFoundingLabel, buildSessionLabel } from './masthead-meta';

interface MastheadMeta {
  foundingLabel: string;
  sessionLabel: string;
}

export const useMastheadMeta = (): MastheadMeta => {
  const data = readySourceData(publicClub.useSource());

  return {
    foundingLabel: buildFoundingLabel(data?.foundedYear ?? null),
    sessionLabel: buildSessionLabel(data?.session.label ?? null),
  };
};
