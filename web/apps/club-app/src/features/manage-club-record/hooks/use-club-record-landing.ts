import { useGoBackTo } from '@/lib/use-go-back-to';
import type { ClubRecordSection } from '../club-record-labels';
import { toSectionLandingKey } from '../club-record-labels';

export const useClubRecordLanding = (): ((section: ClubRecordSection) => void) => {
  const goBackTo = useGoBackTo();

  return (section: ClubRecordSection): void => {
    void goBackTo({
      to: '/manage/club-record',
      search: (previous) => ({ ...previous, changed: toSectionLandingKey(section) }),
      ignoreBlocker: true,
    });
  };
};
