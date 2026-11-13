import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkPanelStack } from '@furria/ui/KkPanelStack';
import type { KkPanelAction } from '@furria/ui/panel-action';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toIsoDay } from '@/lib/day';
import { toAnnouncementShelves } from '../announcement-bulletin';
import {
  ADD_ANNOUNCEMENT_ACTION_LABEL,
  ADD_ANNOUNCEMENT_PILL_LABEL,
  ANNOUNCEMENTS_SECTION_TITLE,
  EXPIRED_ANNOUNCEMENTS_SECTION_TITLE,
} from '../announcements-labels';
import type { Announcement } from '../schemas';
import { AnnouncementListBulletin } from './AnnouncementListBulletin';
import { AnnouncementSheet } from './AnnouncementSheet';
import { AnnouncementsEmpty } from './AnnouncementsEmpty';

interface AnnouncementsListProps {
  announcements: readonly Announcement[];
  lastSeenAt: string | null | undefined;
  mayPost: boolean;
  highlightedKey: string | null;
}

export const AnnouncementsList: FC<AnnouncementsListProps> = ({
  announcements,
  lastSeenAt,
  mayPost,
  highlightedKey,
}) => {
  const action: KkPanelAction | undefined = mayPost
    ? {
        label: ADD_ANNOUNCEMENT_PILL_LABEL,
        icon: 'add',
        ariaLabel: ADD_ANNOUNCEMENT_ACTION_LABEL,
        component: Link,
        to: '/announcements/new',
      }
    : undefined;

  const shelves = toAnnouncementShelves(announcements, toIsoDay(new Date()));

  const currentBulletins = shelves.current.map((announcement) => (
    <AnnouncementListBulletin
      key={announcement.announcementId}
      announcement={announcement}
      lastSeenAt={lastSeenAt}
      isExpired={false}
      highlightedKey={highlightedKey}
    />
  ));
  const expiredBulletins = shelves.expired.map((announcement) => (
    <AnnouncementListBulletin
      key={announcement.announcementId}
      announcement={announcement}
      lastSeenAt={lastSeenAt}
      isExpired
      highlightedKey={highlightedKey}
    />
  ));

  const current =
    currentBulletins.length === 0 ? (
      <AnnouncementsEmpty />
    ) : (
      <Stack sx={{ gap: 1, minWidth: 0 }}>{currentBulletins}</Stack>
    );
  const expired =
    expiredBulletins.length === 0 ? null : (
      <KkPanelSection title={EXPIRED_ANNOUNCEMENTS_SECTION_TITLE}>
        <Stack sx={{ gap: 1, minWidth: 0 }}>{expiredBulletins}</Stack>
      </KkPanelSection>
    );

  return (
    <KkPanelStack>
      <KkPanelSection title={ANNOUNCEMENTS_SECTION_TITLE} action={action}>
        {current}
      </KkPanelSection>
      {expired}
      <AnnouncementSheet announcements={announcements} />
    </KkPanelStack>
  );
};
