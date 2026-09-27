import type { FC } from 'react';
import { usePermissions } from '@/features/session';
import { useClubRecordQuery } from '../api';
import { toClubRecordErrorMessage } from '../club-record-messages';
import { ClubRecordError } from './ClubRecordError';
import { ClubRecordSkeleton } from './ClubRecordSkeleton';
import { ClubRecordView } from './ClubRecordView';

export const ClubRecordBody: FC = () => {
  const clubRecord = useClubRecordQuery();
  const { isUndecided } = usePermissions();
  const errorMessage = toClubRecordErrorMessage(clubRecord.error);

  const reload = (): void => {
    void clubRecord.refetch();
  };

  if (clubRecord.data !== undefined && !isUndecided) {
    return <ClubRecordView record={clubRecord.data} />;
  }
  if (errorMessage !== null) {
    return <ClubRecordError message={errorMessage} onRetry={reload} />;
  }

  return <ClubRecordSkeleton />;
};
