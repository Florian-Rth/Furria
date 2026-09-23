import { KkScreen, KkTitleHeader } from '@furria/ui';
import type { FC } from 'react';
import { CLUB_ORIGIN } from '@/features/session';
import { useLanding } from '@/features/write';
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
    >
      <AnnouncementsBody highlightedKey={highlightedKey} />
    </KkScreen>
  );
};
