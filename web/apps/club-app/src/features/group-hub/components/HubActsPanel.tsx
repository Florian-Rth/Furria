import { KkButton } from '@furria/ui/KkButton';
import { KkErrorState } from '@furria/ui/KkErrorState';
import { KkFacetGrid } from '@furria/ui/KkFacetGrid';
import { KkHubRow } from '@furria/ui/KkHubRow';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkNote } from '@furria/ui/KkNote';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkSkeletonRow } from '@furria/ui/KkSkeletonRow';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { ActCardHubActTile } from '@/features/act-card/components/ActCardHubActTile';
import type { GroupTone } from '@/features/groups/group-identity';
import { useHubActs } from '../hooks/use-hub-acts';
import { HubActRow } from './HubActRow';
import { HubActsSession } from './HubActsSession';

const SECTION_TITLE = 'Auftritte';
const MANAGE_LABEL = 'Auftritte verwalten';
const MANAGE_META = 'Besetzung, Wünsche, neue Auftritte';
const EMPTY_NOTE = 'In dieser Session gibt es noch keinen Auftritt.';
const ERROR_TITLE = 'AUFTRITTE NICHT GELADEN';
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
  const earlier = hub.earlier.map((session) => (
    <HubActsSession key={session.sessionYear} groupId={groupId} session={session} />
  ));
  const manage = canManage ? (
    <KkPanel>
      <KkHubRow
        label={MANAGE_LABEL}
        icon="settings"
        meta={MANAGE_META}
        component={Link}
        to={hub.manageTo}
      />
    </KkPanel>
  ) : null;
  const meta = hub.meta === undefined ? undefined : <KkMeta>{hub.meta}</KkMeta>;

  return (
    <KkPanelSection title={SECTION_TITLE} groupTone={tone} meta={meta}>
      <Stack sx={{ gap: 1.5, minWidth: 0 }}>
        {failure}
        {loading}
        {cards}
        {current}
        {emptyNote}
        {earlier}
        {manage}
      </Stack>
    </KkPanelSection>
  );
};
