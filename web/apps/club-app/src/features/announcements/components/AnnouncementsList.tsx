import type { KkPanelAction } from '@furria/ui';
import { KkPanelSection, KkPanelStack } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { isAnnouncementExpired, isAnnouncementNew } from '@/lib/announcements';
import { toIsoDay } from '@/lib/day';
import {
  ADD_ANNOUNCEMENT_ACTION_LABEL,
  ADD_ANNOUNCEMENT_PILL_LABEL,
  ANNOUNCEMENTS_SECTION_TITLE,
} from '../announcements-labels';
import type { Announcement } from '../schemas';
import { AnnouncementRow } from './AnnouncementRow';
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

  if (announcements.length === 0) {
    return (
      <KkPanelSection title={ANNOUNCEMENTS_SECTION_TITLE} action={action}>
        <AnnouncementsEmpty />
      </KkPanelSection>
    );
  }

  const today = toIsoDay(new Date());

  const rows = announcements.map((announcement) => (
    <AnnouncementRow
      key={announcement.announcementId}
      announcement={announcement}
      isNew={isAnnouncementNew(announcement.publishedAt, lastSeenAt)}
      isExpired={isAnnouncementExpired(announcement.validUntil, today)}
      highlightedKey={highlightedKey}
    />
  ));

  return (
    <KkPanelSection title={ANNOUNCEMENTS_SECTION_TITLE} action={action}>
      <KkPanelStack>{rows}</KkPanelStack>
    </KkPanelSection>
  );
};
