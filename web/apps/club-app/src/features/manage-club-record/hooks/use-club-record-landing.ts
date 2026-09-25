import { useNavigate } from '@tanstack/react-router';
import type { ClubRecordSection } from '../club-record-labels';
import { toSectionLandingKey } from '../club-record-labels';

export const useClubRecordLanding = (): ((section: ClubRecordSection) => void) => {
  const navigate = useNavigate();

  return (section: ClubRecordSection): void => {
    void navigate({
      to: '/manage/club-record',
      search: (previous) => ({ ...previous, changed: toSectionLandingKey(section) }),
      replace: true,
    });
  };
};
