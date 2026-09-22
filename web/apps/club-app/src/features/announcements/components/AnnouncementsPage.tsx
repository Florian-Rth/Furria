import { KkScreen, KkTitleHeader } from '@furria/ui';
import type { FC } from 'react';
import { CLUB_ORIGIN } from '@/features/session';
import { useLanding } from '@/features/write';
import { ANNOUNCEMENTS_TITLE, toAnnouncementsLead } from '../announcements-labels';
import { useAnnouncementsQuery } from '../api';
import { AnnouncementsBody } from './AnnouncementsBody';

export const AnnouncementsPage: FC = () => {
  const announcements = useAnnouncementsQuery();
  const { highlightedKey } = useLanding();

  const lead =
    announcements.data === undefined
      ? undefined
      : toAnnouncementsLead(announcements.data.announcements.length);

  return (
    <KkScreen
      kind="list"
      title={ANNOUNCEMENTS_TITLE}
      origin={CLUB_ORIGIN}
      header={<KkTitleHeader title={ANNOUNCEMENTS_TITLE} lead={lead} />}
    >
      <AnnouncementsBody highlightedKey={highlightedKey} />
    </KkScreen>
  );
};
