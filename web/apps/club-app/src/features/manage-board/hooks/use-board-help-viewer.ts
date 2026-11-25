import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

export interface BoardHelpViewer {
  managesRoles: boolean;
}

export const useBoardHelpViewer = (): BoardHelpViewer => {
  const { has } = usePermissions();

  return { managesRoles: has(PERMISSION_KEYS.rolesManage) };
};
