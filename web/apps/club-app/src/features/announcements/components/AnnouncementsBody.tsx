import type { FC } from 'react';
import { AppListSkeleton, useMeQuery } from '@/features/session';
import { ANNOUNCEMENTS_LOADING_LABEL } from '../announcements-labels';
import { toAnnouncementsErrorMessage } from '../announcements-messages';
import { useAnnouncementsQuery } from '../api';
import type { AnnouncementSheet } from '../hooks/use-announcement-sheet';
import { useAnnouncementWithdrawal } from '../hooks/use-announcement-withdrawal';
import { useLastSeenMark } from '../hooks/use-last-seen-mark';
import { useSeenBaseline } from '../hooks/use-seen-baseline';
import { AnnouncementsError } from './AnnouncementsError';
import { AnnouncementsList } from './AnnouncementsList';
import { WithdrawAnnouncementDialog } from './WithdrawAnnouncementDialog';

interface AnnouncementsBodyProps {
  sheet: AnnouncementSheet;
}

export const AnnouncementsBody: FC<AnnouncementsBodyProps> = ({ sheet }) => {
  const announcements = useAnnouncementsQuery();
  const me = useMeQuery();
  const withdrawal = useAnnouncementWithdrawal();
  const lastSeenAt = useSeenBaseline(me.data?.lastSeenAnnouncementAt);
  const errorMessage = toAnnouncementsErrorMessage(announcements.error);

  useLastSeenMark(announcements.data !== undefined && lastSeenAt !== undefined);

  const reload = (): void => {
    void announcements.refetch();
  };

  if (announcements.data !== undefined) {
    return (
      <>
        <AnnouncementsList
          announcements={announcements.data.announcements}
          lastSeenAt={lastSeenAt}
          onEdit={sheet.openEdit}
          onWithdraw={withdrawal.ask}
        />
        <WithdrawAnnouncementDialog withdrawal={withdrawal} />
      </>
    );
  }
  if (errorMessage !== null) {
    return <AnnouncementsError message={errorMessage} onRetry={reload} />;
  }

  return <AppListSkeleton label={ANNOUNCEMENTS_LOADING_LABEL} listShape="cards" />;
};
