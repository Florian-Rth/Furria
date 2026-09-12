import { KkEmptyState, KkPanel, KkSinceRow } from '@furria/ui';
import type { FC } from 'react';
import { formatSinceSession } from '@/lib/membership-labels';
import { MEMBER_SECTION_TITLES, toNoGroupsDescription } from '../members-labels';
import type { MemberGroup } from '../schemas';
import { MemberSection } from './MemberSection';

const SINCE_LABEL = 'seit';
const EMPTY_TITLE = 'IN KEINER GRUPPE';

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
    />
  ));

  const body =
    rows.length === 0 ? (
      <KkEmptyState title={EMPTY_TITLE} description={toNoGroupsDescription(firstName)} />
    ) : (
      rows
    );

  return (
    <MemberSection title={MEMBER_SECTION_TITLES.groups}>
      <KkPanel>{body}</KkPanel>
    </MemberSection>
  );
};
