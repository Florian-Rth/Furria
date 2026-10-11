import { publicClub } from '@/lib/public-club/api';
import { readySourceData } from '@/lib/public-resource/public-source';
import { buildJoinContactNote } from '../contact-content';

export const useJoinContactNote = (): string => {
  const data = readySourceData(publicClub.useSource());

  return data === undefined ? '' : buildJoinContactNote(data.phone);
};
