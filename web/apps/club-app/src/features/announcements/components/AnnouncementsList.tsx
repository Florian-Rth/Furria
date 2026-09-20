import { KkPanelStack } from '@furria/ui';
import type { FC } from 'react';
import { isAnnouncementExpired, isAnnouncementNew } from '@/lib/announcements';
import { toIsoDay } from '@/lib/day';
import type { Announcement } from '../schemas';
import { AnnouncementRow } from './AnnouncementRow';
import { AnnouncementsEmpty } from './AnnouncementsEmpty';

interface AnnouncementsListProps {
  announcements: readonly Announcement[];
  lastSeenAt: string | null | undefined;
  onEdit: (announcementId: number) => void;
  onWithdraw: (announcement: Announcement) => void;
}

export const AnnouncementsList: FC<AnnouncementsListProps> = ({
  announcements,
  lastSeenAt,
  onEdit,
  onWithdraw,
}) => {
  if (announcements.length === 0) {
    return <AnnouncementsEmpty />;
  }

  const today = toIsoDay(new Date());

  const rows = announcements.map((announcement) => {
    const edit = (): void => {
      onEdit(announcement.announcementId);
    };
    const withdraw = (): void => {
      onWithdraw(announcement);
    };

    return (
      <AnnouncementRow
        key={announcement.announcementId}
        announcement={announcement}
        isNew={isAnnouncementNew(announcement.publishedAt, lastSeenAt)}
        isExpired={isAnnouncementExpired(announcement.validUntil, today)}
        onEdit={edit}
        onWithdraw={withdraw}
      />
    );
  });

  return <KkPanelStack>{rows}</KkPanelStack>;
};
