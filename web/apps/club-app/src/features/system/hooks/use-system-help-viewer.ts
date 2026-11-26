import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

export interface SystemHelpViewer {
  managesClaimWindow: boolean;
}

export const useSystemHelpViewer = (): SystemHelpViewer => ({
  managesClaimWindow: usePermissions().has(PERMISSION_KEYS.claimWindowManage),
});
