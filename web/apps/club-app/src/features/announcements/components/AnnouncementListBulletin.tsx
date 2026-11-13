import type { FC } from 'react';
import { toLandingKey } from '@/features/write/landing-target';
import { isAnnouncementNew } from '@/lib/announcements';
import { toAnnouncementAddOnMarks } from '../announcement-add-ons';
import type { Announcement } from '../schemas';
import { AnnouncementBulletin } from './AnnouncementBulletin';

const LANDING_KIND = 'announcement';

interface AnnouncementListBulletinProps {
  announcement: Announcement;
  lastSeenAt: string | null | undefined;
  isExpired: boolean;
  highlightedKey: string | null;
}

export const AnnouncementListBulletin: FC<AnnouncementListBulletinProps> = ({
  announcement,
  lastSeenAt,
  isExpired,
  highlightedKey,
}) => {
  const landingKey = toLandingKey(LANDING_KIND, announcement.announcementId);
  const landing = announcement.viewerMayEdit ? landingKey : undefined;
  const isHighlighted = announcement.viewerMayEdit && highlightedKey === landingKey;
  const size = isExpired ? 'compact' : 'regular';
  const marks = toAnnouncementAddOnMarks(announcement);
  const isNew = isAnnouncementNew(announcement.publishedAt, lastSeenAt);

  return (
    <AnnouncementBulletin
      announcement={announcement}
      marks={marks}
      size={size}
      isNew={isNew}
      isExpired={isExpired}
      highlight={isHighlighted}
      landing={landing}
    />
  );
};
