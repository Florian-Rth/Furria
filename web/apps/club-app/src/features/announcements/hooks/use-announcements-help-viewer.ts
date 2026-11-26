import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

export interface AnnouncementsHelpViewer {
  mayPost: boolean;
}

export const useAnnouncementsHelpViewer = (): AnnouncementsHelpViewer => {
  const { has } = usePermissions();

  return { mayPost: has(PERMISSION_KEYS.announcementsPost) };
};
