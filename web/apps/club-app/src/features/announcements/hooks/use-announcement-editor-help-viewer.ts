import { useClubGroupReach } from '@/features/whatsapp/hooks/use-club-group-reach';

export interface AnnouncementEditorHelpViewer {
  isEditing: boolean;
  notifies: boolean;
  reachesClubGroup: boolean;
}

export const useAnnouncementEditorHelpViewer = (
  isEditing: boolean,
  notifies: boolean,
): AnnouncementEditorHelpViewer => {
  const reachesClubGroup = useClubGroupReach(notifies);

  return { isEditing, notifies, reachesClubGroup };
};
