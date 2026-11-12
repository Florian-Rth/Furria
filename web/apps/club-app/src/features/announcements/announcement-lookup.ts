import type { Announcement, AnnouncementsResponse } from './schemas';

export type AnnouncementLookup =
  | { state: 'loading' }
  | { state: 'failed'; message: string }
  | { state: 'missing' }
  | { state: 'found'; announcement: Announcement };

interface AnnouncementLookupInput {
  data: AnnouncementsResponse | undefined;
  errorMessage: string | null;
  isFetching: boolean;
  announcementId: number | null;
}

export const toAnnouncementLookup = ({
  data,
  errorMessage,
  isFetching,
  announcementId,
}: AnnouncementLookupInput): AnnouncementLookup => {
  if (data === undefined) {
    return errorMessage === null
      ? { state: 'loading' }
      : { state: 'failed', message: errorMessage };
  }

  const announcement = data.announcements.find((entry) => entry.announcementId === announcementId);
  if (announcement !== undefined) {
    return { state: 'found', announcement };
  }

  return isFetching && announcementId !== null ? { state: 'loading' } : { state: 'missing' };
};
