import { KkPanelStack } from '@furria/ui';
import type { FC } from 'react';
import { useMeQuery } from '@/features/session';
import { useClubHubQuery } from '../api';
import { toClubHubErrorMessage } from '../club-messages';
import { AnnouncementsPanel } from './AnnouncementsPanel';
import { BoardPanel } from './BoardPanel';
import { CalendarPanel } from './CalendarPanel';
import { ClubError } from './ClubError';
import { ClubLinks } from './ClubLinks';
import { ClubSkeleton } from './ClubSkeleton';
import { ClubStats } from './ClubStats';
import { KeyPanel } from './KeyPanel';

export const ClubBody: FC = () => {
  const clubHub = useClubHubQuery();
  const me = useMeQuery();
  const isReady = clubHub.data !== undefined && me.data !== undefined;
  const errorMessage = toClubHubErrorMessage(clubHub.error);

  const reload = (): void => {
    void clubHub.refetch();
  };

  if (isReady) {
    return (
      <KkPanelStack>
        <ClubStats />
        <AnnouncementsPanel />
        <CalendarPanel />
        <BoardPanel />
        <KeyPanel />
        <ClubLinks />
      </KkPanelStack>
    );
  }
  if (errorMessage !== null) {
    return <ClubError message={errorMessage} onRetry={reload} />;
  }

  return <ClubSkeleton />;
};
