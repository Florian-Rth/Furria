import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useClubRecordQuery } from '../api';
import { toClubRecordErrorMessage } from '../club-record-messages';
import type { ClubRecord } from '../schemas';

export interface ClubSectionGate {
  record: ClubRecord | null;
  errorMessage: string | null;
  reload: () => void;
}

export const useClubSectionGate = (): ClubSectionGate => {
  const permissions = usePermissions();
  const clubRecord = useClubRecordQuery();
  const isGranted = !permissions.isUndecided && permissions.has(PERMISSION_KEYS.clubManage);

  return {
    record: isGranted ? (clubRecord.data ?? null) : null,
    errorMessage: toClubRecordErrorMessage(clubRecord.error),
    reload: () => {
      void clubRecord.refetch();
    },
  };
};
