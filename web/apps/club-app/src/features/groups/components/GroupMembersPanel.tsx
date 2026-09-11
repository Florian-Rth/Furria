import { KkMeta, KkPanel, KkSinceRow } from '@furria/ui';
import type { FC } from 'react';
import { formatSinceSession } from '@/lib/membership-labels';
import { GROUP_SECTION_TITLES, toMemberCountLabel, toNoMembersLine } from '../groups-labels';
import type { GroupMember } from '../schemas';
import { GroupSection } from './GroupSection';

const SINCE_LABEL = 'seit';

interface GroupMembersPanelProps {
  members: readonly GroupMember[];
  groupName: string;
}

export const GroupMembersPanel: FC<GroupMembersPanelProps> = ({ members, groupName }) => {
  const rows = members.map((member) => {
    const memberName = `${member.firstName} ${member.lastName}`;

    return (
      <KkSinceRow
        key={member.personId}
        icon="person"
        title={memberName}
        sinceLabel={SINCE_LABEL}
        sinceValue={formatSinceSession(member.since)}
      />
    );
  });

  const isEmpty = rows.length === 0;
  const body = isEmpty ? <KkMeta italic>{toNoMembersLine(groupName)}</KkMeta> : rows;
  const variant = isEmpty ? 'block' : 'list';
  const countMeta = isEmpty ? undefined : toMemberCountLabel(members.length);

  return (
    <GroupSection title={GROUP_SECTION_TITLES.members} meta={countMeta}>
      <KkPanel variant={variant}>{body}</KkPanel>
    </GroupSection>
  );
};
