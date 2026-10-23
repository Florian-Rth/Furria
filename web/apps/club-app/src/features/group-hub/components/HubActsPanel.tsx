import { KkHubRow } from '@furria/ui/KkHubRow';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { GroupTone } from '@/features/groups/group-identity';
import { useActsQuery } from '@/features/running-order/api';
import { toHubActsMeta } from '../group-hub-labels';

const SECTION_TITLE = 'Auftritte';
const ROW_LABEL = 'Unsere Auftritte';

interface HubActsPanelProps {
  groupId: number;
  tone: GroupTone;
}

export const HubActsPanel: FC<HubActsPanelProps> = ({ groupId, tone }) => {
  const acts = useActsQuery();
  const count =
    acts.data?.acts.filter((act) => act.group?.groupId === groupId && !act.archived).length ?? null;
  const meta = toHubActsMeta(count);
  const to = `/groups/${groupId}/acts`;

  return (
    <KkPanelSection title={SECTION_TITLE} groupTone={tone}>
      <KkPanel>
        <KkHubRow label={ROW_LABEL} icon="stage" meta={meta} component={Link} to={to} />
      </KkPanel>
    </KkPanelSection>
  );
};
