import { useGroupsQuery } from '@/features/groups/api';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import type { ChoosableGroup, IntakeRights } from '../intake-rules';

export interface IntakeRightsState {
  rights: IntakeRights;
  groups: readonly ChoosableGroup[];
  isUndecided: boolean;
  hasFailed: boolean;
  retry: () => void;
}

export const useIntakeRights = (): IntakeRightsState => {
  const permissions = usePermissions();
  const groupsQuery = useGroupsQuery();
  const groups = groupsQuery.data?.groups ?? [];
  const choosable = groups.map((group) => ({ groupId: group.groupId, name: group.name }));

  const retry = (): void => {
    void groupsQuery.refetch();
  };

  return {
    rights: {
      managesPersons: permissions.has(PERMISSION_KEYS.personsManage),
      administeredGroupIds: groups
        .filter((group) => group.viewerIsAdmin)
        .map((group) => group.groupId),
    },
    groups: choosable,
    isUndecided: permissions.isUndecided || groupsQuery.isPending,
    hasFailed: groupsQuery.data === undefined && groupsQuery.error !== null,
    retry,
  };
};
