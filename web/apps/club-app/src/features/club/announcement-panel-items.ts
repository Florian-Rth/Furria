import type { AnnouncementAddOnMark } from '@/features/announcements/announcement-add-ons';
import { toAnnouncementAddOnMarks } from '@/features/announcements/announcement-add-ons';
import type { BulletinSize } from '@/features/announcements/announcement-bulletin';
import type { Announcement } from '@/features/announcements/schemas';
import { isAnnouncementNew } from '@/lib/announcements';
import type { ClubAnnouncement } from './schemas';

export interface AnnouncementPanelItem {
  announcement: ClubAnnouncement;
  size: BulletinSize;
  isNew: boolean;
  marks: AnnouncementAddOnMark[];
}

const NO_MARKS: AnnouncementAddOnMark[] = [];
const FULL_ITEM_COUNT = 2;

export const toAnnouncementPanelItems = (
  newest: readonly ClubAnnouncement[],
  details: readonly Announcement[],
  lastSeenAt: string | null | undefined,
): AnnouncementPanelItem[] =>
  newest.map((announcement, index) => {
    const detail = details.find(
      (candidate) => candidate.announcementId === announcement.announcementId,
    );

    return {
      announcement,
      size: index < FULL_ITEM_COUNT ? 'regular' : 'compact',
      isNew: isAnnouncementNew(announcement.publishedAt, lastSeenAt),
      marks: detail === undefined ? NO_MARKS : toAnnouncementAddOnMarks(detail),
    };
  });
