import { useKkSheet } from '@furria/ui/sheet-store';
import { toPeekedId } from '@/lib/peek';
import { usePeek } from '@/lib/use-peek';
import type { GroupSummary } from '../schemas';

const toGroupId = (group: GroupSummary): number => group.groupId;

export type GroupPeek =
  | { kind: 'closed' }
  | { kind: 'shown'; group: GroupSummary }
  | { kind: 'missing'; groupId: number };

export const useGroupPeek = (groups: readonly GroupSummary[]): GroupPeek => {
  const { openSheetId } = useKkSheet();
  const peekedId = toPeekedId(openSheetId, 'group');
  const group = usePeek('group', groups, toGroupId);

  if (group !== null) {
    return { kind: 'shown', group };
  }
  if (peekedId !== null) {
    return { kind: 'missing', groupId: peekedId };
  }

  return { kind: 'closed' };
};
