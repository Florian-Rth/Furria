import { currentYear } from '@/lib/club';
import { publicClub } from '@/lib/public-club/api';
import { readySourceData } from '@/lib/public-resource/public-source';
import { buildClubLine, buildCopyrightLine } from './footer-lines';

interface FooterLines {
  clubLine: string;
  copyrightLine: string;
}

export const useFooterLines = (): FooterLines => {
  const data = readySourceData(publicClub.useSource());
  const name = data?.name ?? null;

  return {
    clubLine: buildClubLine(name, data?.foundedYear ?? null),
    copyrightLine: buildCopyrightLine(name, currentYear),
  };
};
