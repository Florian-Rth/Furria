import { useAnnouncementsQuery } from '@/features/announcements/api';
import type { Announcement } from '@/features/announcements/schemas';
import { useMeQuery } from '@/features/session/api';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import type { AnnouncementPanelItem } from '../announcement-panel-items';
import { toAnnouncementPanelItems } from '../announcement-panel-items';
import { useClubHubQuery } from '../api';

export interface AnnouncementsPanelView {
  items: AnnouncementPanelItem[];
  details: readonly Announcement[];
  totalCount: number;
  canPost: boolean;
}

const NO_DETAILS: readonly Announcement[] = [];

export const useAnnouncementsPanel = (): AnnouncementsPanelView | null => {
  const clubHub = useClubHubQuery();
  const announcementsQuery = useAnnouncementsQuery();
  const me = useMeQuery();
  const { has } = usePermissions();

  const announcements = clubHub.data?.announcements;
  const canPost = has(PERMISSION_KEYS.announcementsPost);

  if (announcements === undefined) {
    return null;
  }
  if (announcements.newest.length === 0 && !canPost) {
    return null;
  }

  const details = announcementsQuery.data?.announcements ?? NO_DETAILS;

  return {
    items: toAnnouncementPanelItems(announcements.newest, details, me.data?.lastSeenAnnouncementAt),
    details,
    totalCount: announcements.totalCount,
    canPost,
  };
};
