import { KkEmptyState, KkPanel, KkSinceRow } from '@furria/ui';
import type { FC } from 'react';
import { formatSinceSession } from '@/lib/membership-labels';
import { HUB_SECTION_TITLES, toNoMembersLine } from '../group-hub-labels';
import type { HubMember } from '../schemas';
import { HubSection } from './HubSection';

const SINCE_LABEL = 'seit';
const NO_MEMBERS_TITLE = 'NOCH NIEMAND DABEI';

interface HubMembersPanelProps {
  members: readonly HubMember[];
  groupName: string;
}

export const HubMembersPanel: FC<HubMembersPanelProps> = ({ members, groupName }) => {
  const rows = members.map((member) => {
    const memberName = `${member.firstName} ${member.lastName}`;

    return (
      <KkSinceRow
        key={member.groupMembershipId}
        icon="person"
        title={memberName}
        sinceLabel={SINCE_LABEL}
        sinceValue={formatSinceSession(member.since)}
      />
    );
  });

  const isEmpty = rows.length === 0;
  const variant = isEmpty ? 'block' : 'list';

  const body = isEmpty ? (
    <KkEmptyState icon="person" title={NO_MEMBERS_TITLE} description={toNoMembersLine(groupName)} />
  ) : (
    rows
  );

  return (
    <HubSection title={HUB_SECTION_TITLES.members}>
      <KkPanel variant={variant}>{body}</KkPanel>
    </HubSection>
  );
};
