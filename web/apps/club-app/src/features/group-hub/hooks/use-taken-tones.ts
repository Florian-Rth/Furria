import { useGroupsQuery } from '@/features/groups';
import { usePermissions } from '@/features/session';
import type { GroupTone } from '@/lib/group-tone';
import type { GroupToneHolder } from '../group-hub-labels';
import { toTakenTones } from '../group-hub-labels';

const NO_TONE_HOLDERS: readonly GroupToneHolder[] = [];

export const useTakenTones = (groupId: number, canPick: boolean): ReadonlySet<GroupTone> | null => {
  const { isAffiliated, isUndecided } = usePermissions();
  const readsDirectory = canPick && isAffiliated;
  const groups = useGroupsQuery(readsDirectory);

  if (isUndecided || (readsDirectory && groups.isPending)) {
    return null;
  }

  return toTakenTones(groups.data?.groups ?? NO_TONE_HOLDERS, groupId);
};
