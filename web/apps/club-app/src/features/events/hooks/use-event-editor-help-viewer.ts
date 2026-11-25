import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

export interface EventEditorHelpViewer {
  isEditing: boolean;
  addsPlaces: boolean;
}

export const useEventEditorHelpViewer = (isEditing: boolean): EventEditorHelpViewer => {
  const permissions = usePermissions();

  return { isEditing, addsPlaces: permissions.has(PERMISSION_KEYS.clubManage) };
};
