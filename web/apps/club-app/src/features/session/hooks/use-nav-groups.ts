import { useMyGroupsQuery } from '@/features/group-hub';
import type { AppSectionGroup, NavGroupRef } from '../app-sections';
import { buildNavGroups } from '../app-sections';
import { usePermissions } from './use-permissions';

const NO_GROUPS: readonly NavGroupRef[] = [];

export const useNavGroups = (): AppSectionGroup[] => {
  const { keys } = usePermissions();
  const myGroups = useMyGroupsQuery();

  return buildNavGroups({
    permissionKeys: keys,
    myGroups: myGroups.data?.groups ?? NO_GROUPS,
  });
};
