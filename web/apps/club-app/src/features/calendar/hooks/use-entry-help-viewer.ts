import { useClubGroupReach } from '@/features/whatsapp/hooks/use-club-group-reach';

export interface EntryHelpViewer {
  isEditing: boolean;
  notifies: boolean;
  reachesClubGroup: boolean;
}

export const useEntryHelpViewer = (isEditing: boolean, notifies: boolean): EntryHelpViewer => {
  const reachesClubGroup = useClubGroupReach(notifies);

  return { isEditing, notifies, reachesClubGroup };
};
