import { currentYear } from '@/lib/club';
import { usePublicClubQuery } from '@/lib/public-club/api';
import { buildClubLine, buildCopyrightLine } from './footer-lines';

interface FooterLines {
  clubLine: string;
  copyrightLine: string;
}

export const useFooterLines = (): FooterLines => {
  const { data } = usePublicClubQuery();
  const name = data?.name ?? null;

  return {
    clubLine: buildClubLine(name, data?.foundedYear ?? null),
    copyrightLine: buildCopyrightLine(name, currentYear),
  };
};
