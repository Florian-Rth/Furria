import type { KkScreenActions } from '@furria/ui/screen-declaration';
import { useNavigate } from '@tanstack/react-router';
import { isAnnouncementExpired } from '@/lib/announcements';
import { toIsoDay } from '@/lib/day';
import type { AnnouncementLookup } from '../announcement-lookup';
import { ANNOUNCEMENT_EDIT_ROUTE } from '../announcement-routes';
import { ANNOUNCEMENT_EDIT_ACTION_LABEL } from '../announcements-labels';
import type { Announcement } from '../schemas';
import { useAnnouncementLookup } from './use-announcement-lookup';

interface AnnouncementReading {
  lookup: AnnouncementLookup;
  isRetrying: boolean;
  retry: () => void;
  isExpired: boolean;
  actions: KkScreenActions | undefined;
}

const NO_ANNOUNCEMENT = null;

export const useAnnouncementReading = (announcementId: string): AnnouncementReading => {
  const navigate = useNavigate();
  const { lookup, isRetrying, retry } = useAnnouncementLookup(announcementId);
  const announcement: Announcement | null =
    lookup.state === 'found' ? lookup.announcement : NO_ANNOUNCEMENT;
  const params = { announcementId };

  const openEditor = (): void => {
    void navigate({ to: ANNOUNCEMENT_EDIT_ROUTE, params });
  };
  const actions: KkScreenActions | undefined = announcement?.viewerMayEdit
    ? [
        {
          id: 'announcement-edit',
          label: ANNOUNCEMENT_EDIT_ACTION_LABEL,
          icon: 'edit',
          link: { to: ANNOUNCEMENT_EDIT_ROUTE, params },
          onSelect: openEditor,
        },
      ]
    : undefined;
  const isExpired =
    announcement !== null && isAnnouncementExpired(announcement.validUntil, toIsoDay(new Date()));

  return { lookup, isRetrying, retry, isExpired, actions };
};
