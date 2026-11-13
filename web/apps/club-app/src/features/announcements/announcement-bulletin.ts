import type { KkBulletinMark, KkBulletinMarkItem } from '@furria/ui/bulletin';
import type { KkStepState } from '@furria/ui/step-state';
import { CALENDAR_ADD_ON_ICONS } from '@/features/calendar/calendar-add-ons';
import { isAnnouncementExpired } from '@/lib/announcements';
import type { AnnouncementAddOnMark, AnnouncementAddOnState } from './announcement-add-ons';
import { owesAnyAnswer } from './announcement-add-ons';
import { toAddOnMarkLabel } from './announcements-labels';
import type { Announcement, AnnouncementAuthor } from './schemas';

export type BulletinSize = 'regular' | 'compact';

export type BulletinAnnouncement = Pick<
  Announcement,
  'announcementId' | 'title' | 'body' | 'mentions' | 'publishedAt' | 'validUntil'
> & {
  author: Pick<AnnouncementAuthor, 'firstName' | 'lastName'> | null;
};

export const ADD_ON_BADGE_STATES: Record<AnnouncementAddOnState, KkStepState> = {
  owed: 'current',
  answered: 'done',
  closed: 'off',
  quiet: 'open',
};

export const toBulletinMark = (
  marks: readonly AnnouncementAddOnMark[],
  isNew: boolean,
  isExpired: boolean,
): KkBulletinMark => {
  if (isExpired) {
    return 'none';
  }
  if (owesAnyAnswer(marks)) {
    return 'owed';
  }

  return isNew ? 'new' : 'none';
};

export const toBulletinMarkItems = (
  marks: readonly AnnouncementAddOnMark[],
): KkBulletinMarkItem[] =>
  marks.map((mark) => ({
    key: mark.key,
    icon: CALENDAR_ADD_ON_ICONS[mark.kind],
    state: ADD_ON_BADGE_STATES[mark.state],
    label: toAddOnMarkLabel(mark),
  }));

export const toAnswerAnchorId = (announcementId: number, key: string): string =>
  `announcement-${announcementId}-answer-${key}`;

export interface AnnouncementShelves<TAnnouncement> {
  current: TAnnouncement[];
  expired: TAnnouncement[];
}

export const toAnnouncementShelves = <TAnnouncement extends Pick<Announcement, 'validUntil'>>(
  announcements: readonly TAnnouncement[],
  todayIsoDay: string,
): AnnouncementShelves<TAnnouncement> => ({
  current: announcements.filter(
    (announcement) => !isAnnouncementExpired(announcement.validUntil, todayIsoDay),
  ),
  expired: announcements.filter((announcement) =>
    isAnnouncementExpired(announcement.validUntil, todayIsoDay),
  ),
});
