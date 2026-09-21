import { useGroupsQuery } from '@/features/groups';
import { usePermissions } from '@/features/session';
import type { GroupTone } from '@/lib/group-tone';
import type { GroupToneHolder } from '../group-hub-labels';
import { toTakenTones } from '../group-hub-labels';

const NO_TONE_HOLDERS: readonly GroupToneHolder[] = [];

export const useTakenTones = (groupId: number, canPick: boolean): ReadonlySet<GroupTone> => {
  const { isAffiliated } = usePermissions();
  const groups = useGroupsQuery(canPick && isAffiliated);

  return toTakenTones(groups.data?.groups ?? NO_TONE_HOLDERS, groupId);
};
