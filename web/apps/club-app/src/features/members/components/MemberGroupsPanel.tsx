import { KkEmptyState, KkPanel, KkPanelSection, KkSinceRow } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { formatSinceSession } from '@/lib/membership-labels';
import { MEMBER_SECTION_TITLES, toNoGroupsDescription } from '../members-labels';
import type { MemberGroup } from '../schemas';

const SINCE_LABEL = 'seit';
const EMPTY_TITLE = 'IN KEINER GRUPPE';
const GROUP_PATH = '/groups/$groupId';

interface MemberGroupsPanelProps {
  groups: readonly MemberGroup[];
  firstName: string;
}

export const MemberGroupsPanel: FC<MemberGroupsPanelProps> = ({ groups, firstName }) => {
  const rows = groups.map((group) => (
    <KkSinceRow
      key={group.groupId}
      icon="group"
      title={group.name}
      sinceLabel={SINCE_LABEL}
      sinceValue={formatSinceSession(group.since)}
      component={Link}
      to={GROUP_PATH}
      params={{ groupId: String(group.groupId) }}
    />
  ));

  const body =
    rows.length === 0 ? (
      <KkEmptyState
        size="panel"
        title={EMPTY_TITLE}
        description={toNoGroupsDescription(firstName)}
      />
    ) : (
      rows
    );

  return (
    <KkPanelSection title={MEMBER_SECTION_TITLES.groups}>
      <KkPanel>{body}</KkPanel>
    </KkPanelSection>
  );
};
