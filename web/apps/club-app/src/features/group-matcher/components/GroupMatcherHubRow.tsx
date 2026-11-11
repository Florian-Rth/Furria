import { KkHubRow } from '@furria/ui/KkHubRow';
import { KkPanel } from '@furria/ui/KkPanel';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { GROUP_MATCHER_TITLE, toStandingHint } from '../group-matcher-labels';
import { toGroupMatcherStanding } from '../group-matcher-page';
import type { GroupMatcherStatus } from '../schemas';

const toGroupMatcherPath = (groupId: number): string => `/groups/${groupId}/group-matcher`;

interface GroupMatcherHubRowProps {
  groupId: number;
  status: GroupMatcherStatus;
}

export const GroupMatcherHubRow: FC<GroupMatcherHubRowProps> = ({ groupId, status }) => {
  const hint = toStandingHint(toGroupMatcherStanding(status));
  const path = toGroupMatcherPath(groupId);

  return (
    <KkPanel>
      <KkHubRow
        label={GROUP_MATCHER_TITLE}
        icon="checkCircle"
        hint={hint.label}
        hintTone={hint.tone}
        component={Link}
        to={path}
      />
    </KkPanel>
  );
};
