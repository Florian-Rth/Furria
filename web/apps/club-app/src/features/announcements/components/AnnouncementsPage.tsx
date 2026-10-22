import { KkScreen } from '@furria/ui/KkScreen';
import { KkTitleHeader } from '@furria/ui/KkTitleHeader';
import type { FC } from 'react';
import { AREA_HANDOVERS, CLUB_ORIGIN } from '@/features/session/app-sections';
import { useLanding } from '@/features/write/hooks/use-landing';
import { ANNOUNCEMENTS_LEAD, ANNOUNCEMENTS_TITLE } from '../announcements-labels';
import { AnnouncementsBody } from './AnnouncementsBody';

export const AnnouncementsPage: FC = () => {
  const { highlightedKey } = useLanding();

  return (
    <KkScreen
      kind="list"
      title={ANNOUNCEMENTS_TITLE}
      origin={CLUB_ORIGIN}
      header={<KkTitleHeader title={ANNOUNCEMENTS_TITLE} lead={ANNOUNCEMENTS_LEAD} />}
      handover={AREA_HANDOVERS.announcements}
    >
      <AnnouncementsBody highlightedKey={highlightedKey} />
    </KkScreen>
  );
};
