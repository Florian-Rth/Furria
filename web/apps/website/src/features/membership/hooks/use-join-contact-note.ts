import { usePublicClubQuery } from '@/lib/public-club/api';
import { buildJoinContactNote } from '../contact-content';

export const useJoinContactNote = (): string => {
  const { data } = usePublicClubQuery();

  return data === undefined ? '' : buildJoinContactNote(data.phone);
};
