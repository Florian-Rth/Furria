import type { FC } from 'react';
import { toLandingKey } from '@/features/write';
import type { ManagedGroupSummary } from '../schemas';
import { GroupRegisterRow } from './GroupRegisterRow';

interface GroupRegisterBandProps {
  groups: readonly ManagedGroupSummary[];
  highlightedKey: string | null;
}

export const GroupRegisterBand: FC<GroupRegisterBandProps> = ({ groups, highlightedKey }) => (
  <>
    {groups.map((group) => (
      <GroupRegisterRow
        key={group.groupId}
        group={group}
        highlight={highlightedKey === toLandingKey('group', group.groupId)}
      />
    ))}
  </>
);
