import { parsePositiveId } from '@/lib/positive-id';
import { type AnnouncementLookup, toAnnouncementLookup } from '../announcement-lookup';
import { toAnnouncementsErrorMessage } from '../announcements-messages';
import { useFreshAnnouncementsQuery } from '../api';

interface AnnouncementLookupState {
  lookup: AnnouncementLookup;
  isRetrying: boolean;
  retry: () => void;
}

export const useAnnouncementLookup = (announcementId: string): AnnouncementLookupState => {
  const announcements = useFreshAnnouncementsQuery();
  const lookup = toAnnouncementLookup({
    data: announcements.data,
    errorMessage: toAnnouncementsErrorMessage(announcements.error),
    isFetching: announcements.isFetching,
    announcementId: parsePositiveId(announcementId),
  });

  const retry = (): void => {
    void announcements.refetch();
  };

  return { lookup, isRetrying: announcements.isFetching, retry };
};
