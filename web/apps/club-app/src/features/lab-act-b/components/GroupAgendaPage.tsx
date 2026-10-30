import { KkAgenda } from '@furria/ui/KkAgenda';
import { KkHubRow } from '@furria/ui/KkHubRow';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkNote } from '@furria/ui/KkNote';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkSkeletonRow } from '@furria/ui/KkSkeletonRow';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { HubNotFound } from '@/features/group-hub/components/HubNotFound';
import { GROUPS_ORIGIN } from '@/features/session/app-sections';
import { NotAffiliatedState } from '@/features/session/components/NotAffiliatedState';
import { ACTS_EMPTY, ACTS_FAILED, ACTS_TITLE, HUB_REST_LABEL, HUB_REST_META } from '../agenda-copy';
import { useGroupAgendaPage } from '../hooks/use-group-agenda-page';
import { GroupAgendaAct } from './GroupAgendaAct';

const SKELETON_ROWS = 4;

interface GroupAgendaPageProps {
  groupId: string;
}

export const GroupAgendaPage: FC<GroupAgendaPageProps> = ({ groupId }) => {
  const page = useGroupAgendaPage(groupId);
  const items = (page.acts ?? []).map((entry, index) => (
    <GroupAgendaAct
      key={entry.act.actId}
      entry={entry}
      index={index}
      soonest={entry.act.actId === page.soonestActId}
    />
  ));
  const count = page.acts === null ? undefined : <KkMeta>{page.acts.length}</KkMeta>;
  const failed = page.actsFailed ? <KkNote tone="hint">{ACTS_FAILED}</KkNote> : null;
  const loading =
    page.acts === null && !page.actsFailed ? (
      <KkSkeletonRow count={SKELETON_ROWS} shape="select" />
    ) : null;
  const empty = page.acts !== null && items.length === 0 ? <KkNote>{ACTS_EMPTY}</KkNote> : null;
  const list =
    items.length === 0 ? null : <KkAgenda.Acts label={ACTS_TITLE}>{items}</KkAgenda.Acts>;
  const statusBody = {
    missing: <HubNotFound />,
    denied: <NotAffiliatedState />,
  };

  if (page.status === 'missing' || page.status === 'denied') {
    return (
      <KkScreen kind="detail" title={page.title} origin={GROUPS_ORIGIN}>
        {statusBody[page.status]}
      </KkScreen>
    );
  }

  return (
    <KkScreen kind="detail" title={page.title} origin={GROUPS_ORIGIN}>
      <Stack sx={{ gap: 2.5, minWidth: 0 }}>
        <KkAgenda.Strip
          title={page.strip.title}
          icon={page.strip.icon}
          facts={page.strip.facts}
          tone={page.strip.tone}
        />
        <Grid container columnSpacing={5} rowSpacing={2.5}>
          <Grid size={{ xs: 12, md: 8 }} sx={{ minWidth: 0 }}>
            <KkPanelSection title={ACTS_TITLE} meta={count}>
              {failed}
              {loading}
              {list}
              {empty}
            </KkPanelSection>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ minWidth: 0 }}>
            <KkPanel>
              <KkHubRow
                label={HUB_REST_LABEL}
                icon="group"
                meta={HUB_REST_META}
                component={Link}
                to={page.hubTo}
              />
            </KkPanel>
          </Grid>
        </Grid>
      </Stack>
    </KkScreen>
  );
};
