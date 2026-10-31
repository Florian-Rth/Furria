import { KkButton } from '@furria/ui/KkButton';
import { KkErrorState } from '@furria/ui/KkErrorState';
import { KkFacetGrid } from '@furria/ui/KkFacetGrid';
import { KkHubRow } from '@furria/ui/KkHubRow';
import { KkNote } from '@furria/ui/KkNote';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkSkeletonRow } from '@furria/ui/KkSkeletonRow';
import type { KkPanelAction } from '@furria/ui/panel-action';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { ActCardHubActTile } from '@/features/act-card/components/ActCardHubActTile';
import { HISTORY_LINK_LABEL, NEW_ACT_LABEL } from '@/features/acts/acts-copy';
import { NEW_ACT } from '@/features/acts/schemas';
import type { GroupTone } from '@/features/groups/group-identity';
import { useHubActs } from '../hooks/use-hub-acts';
import { HubActRow } from './HubActRow';

const SECTION_TITLE = 'Sessionsauftritte';
const NEW_LABEL = 'Neu';
const EMPTY_NOTE = 'In dieser Session gibt es noch keinen Sessionsauftritt.';
const ERROR_TITLE = 'SESSIONSAUFTRITTE NICHT GELADEN';
const RETRY_LABEL = 'Noch einmal';
const SKELETON_ROWS = 2;

interface HubActsPanelProps {
  groupId: number;
  tone: GroupTone;
  canManage: boolean;
}

export const HubActsPanel: FC<HubActsPanelProps> = ({ groupId, tone, canManage }) => {
  const hub = useHubActs(groupId);
  const cardCells = hub.cards.map((card, order) => (
    <KkFacetGrid.Cell key={card.act.actId} reach="wide">
      <ActCardHubActTile card={card} groupId={groupId} viewerId={hub.viewerId} order={order} />
    </KkFacetGrid.Cell>
  ));
  const currentRows = hub.others.map((act) => (
    <HubActRow key={act.actId} groupId={groupId} act={act} />
  ));
  const retry = (
    <KkButton size="small" variant="outlined" onClick={hub.retry}>
      {RETRY_LABEL}
    </KkButton>
  );
  const failure =
    hub.errorMessage === null ? null : (
      <KkPanel variant="block">
        <KkErrorState title={ERROR_TITLE} description={hub.errorMessage} action={retry} />
      </KkPanel>
    );
  const loading = hub.isLoading ? (
    <KkPanel variant="block">
      <KkSkeletonRow count={SKELETON_ROWS} shape="select" />
    </KkPanel>
  ) : null;
  const emptyNote =
    hub.loaded && cardCells.length === 0 && currentRows.length === 0 ? (
      <KkNote>{EMPTY_NOTE}</KkNote>
    ) : null;
  const cards = cardCells.length === 0 ? null : <KkFacetGrid>{cardCells}</KkFacetGrid>;
  const current = currentRows.length === 0 ? null : <KkPanel>{currentRows}</KkPanel>;
  const history = (
    <KkPanel>
      <KkHubRow
        label={HISTORY_LINK_LABEL}
        icon="timeline"
        meta={hub.historyMeta}
        component={Link}
        to={hub.historyTo}
      />
    </KkPanel>
  );
  const action: KkPanelAction | undefined = canManage
    ? {
        label: NEW_LABEL,
        ariaLabel: NEW_ACT_LABEL,
        icon: 'add',
        emphasis: 'quiet',
        component: Link,
        to: hub.historyTo,
        search: { act: NEW_ACT },
      }
    : undefined;
  return (
    <KkPanelSection title={SECTION_TITLE} groupTone={tone} action={action}>
      <Stack sx={{ gap: 1.5, minWidth: 0 }}>
        {failure}
        {loading}
        {cards}
        {current}
        {emptyNote}
        {history}
      </Stack>
    </KkPanelSection>
  );
};
