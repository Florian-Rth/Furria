import type { AppSectionGroup, NavGroupRef } from '../app-sections';
import { buildNavGroups } from '../app-sections';
import { usePermissions } from './use-permissions';

const NO_GROUPS: readonly NavGroupRef[] = [];

export const useNavGroups = (): AppSectionGroup[] => {
  const { keys } = usePermissions();

  return buildNavGroups({ permissionKeys: keys, myGroups: NO_GROUPS });
};
