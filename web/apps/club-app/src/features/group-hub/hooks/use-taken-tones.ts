import { useGroupsQuery } from '@/features/groups/api';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import type { GroupTone } from '@/lib/group-tone';
import type { GroupToneHolder } from '../group-hub-labels';
import { toTakenTones } from '../group-hub-labels';

const NO_TONE_HOLDERS: readonly GroupToneHolder[] = [];

export type TakenTonesState =
  | { kind: 'pending' }
  | { kind: 'failed'; error: Error }
  | { kind: 'ready'; tones: ReadonlySet<GroupTone> };

export interface TakenTonesControl {
  state: TakenTonesState;
  isRetrying: boolean;
  retry: () => void;
}

export const useTakenTones = (groupId: number, canPick: boolean): TakenTonesControl => {
  const { isUndecided } = usePermissions();
  const readsDirectory = canPick && !isUndecided;
  const groups = useGroupsQuery(readsDirectory);

  const retry = (): void => {
    void groups.refetch();
  };

  const toState = (): TakenTonesState => {
    if (readsDirectory && groups.data === undefined && groups.error !== null) {
      return { kind: 'failed', error: groups.error };
    }
    if (isUndecided || (readsDirectory && groups.isPending)) {
      return { kind: 'pending' };
    }

    return { kind: 'ready', tones: toTakenTones(groups.data?.groups ?? NO_TONE_HOLDERS, groupId) };
  };

  return { state: toState(), isRetrying: groups.isFetching, retry };
};
