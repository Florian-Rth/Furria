import { formatIsoDay } from '@/lib/membership-labels';

const ISO_DAY_LENGTH = 10;

export const ANNOUNCEMENT_FORM_SHEET_ID = 'announcement-form';

export const ANNOUNCEMENT_NEW_LABEL = 'neu';
export const ANNOUNCEMENT_PORTRAIT_LABEL = 'porträt';

export const formatPublishedDay = (publishedAt: string): string =>
  formatIsoDay(publishedAt.slice(0, ISO_DAY_LENGTH));

export const isAnnouncementNew = (
  publishedAt: string,
  lastSeenAnnouncementAt: string | null | undefined,
): boolean => {
  if (lastSeenAnnouncementAt === undefined) {
    return false;
  }
  if (lastSeenAnnouncementAt === null) {
    return true;
  }

  return Date.parse(publishedAt) > Date.parse(lastSeenAnnouncementAt);
};

export const isAnnouncementExpired = (validUntil: string | null, todayIsoDay: string): boolean =>
  validUntil !== null && validUntil < todayIsoDay;
