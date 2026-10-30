import { KkAgenda } from '@furria/ui/KkAgenda';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkSegmentSwitch } from '@furria/ui/KkSegmentSwitch';
import { KkSkeletonRow } from '@furria/ui/KkSkeletonRow';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { ACT_DENIED_MESSAGE } from '@/features/acts/act-page-copy';
import { START_ORIGIN } from '@/features/session/app-sections';
import { AccessDeniedScreen } from '@/features/session/components/AccessDeniedScreen';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { VIEW_SWITCH_ITEMS, VIEW_SWITCH_LABEL } from '../agenda-copy';
import { useAgendaActPage } from '../hooks/use-agenda-act-page';
import type { AgendaView } from '../schemas';
import { AgendaDetails } from './AgendaDetails';
import { AgendaMine } from './AgendaMine';

const SKELETON_ROWS = 5;

interface AgendaActPageProps {
  actId: string;
  view: AgendaView | undefined;
}

export const AgendaActPage: FC<AgendaActPageProps> = ({ actId, view }) => {
  const page = useAgendaActPage(actId, view);

  if (page.status === 'missing') {
    return <ScreenNotFound />;
  }
  if (page.status === 'denied') {
    return (
      <AccessDeniedScreen title={page.title} origin={START_ORIGIN} message={ACT_DENIED_MESSAGE} />
    );
  }

  const viewSwitch = page.canSwitch ? (
    <KkSegmentSwitch
      label={VIEW_SWITCH_LABEL}
      items={VIEW_SWITCH_ITEMS}
      value={page.view}
      onChange={page.switchView}
    />
  ) : null;
  const details =
    page.data === undefined ? null : <AgendaDetails data={page.data} viewerId={page.viewerId} />;
  const content = page.view === 'details' ? details : <AgendaMine page={page} />;
  const body =
    page.status === 'loading' ? <KkSkeletonRow count={SKELETON_ROWS} shape="select" /> : content;

  return (
    <KkScreen kind="detail" title={page.title} origin={page.origin} action={page.bar}>
      <Stack sx={{ gap: 1.5, minWidth: 0 }}>
        <KkAgenda.Strip
          title={page.strip.title}
          icon={page.strip.icon}
          facts={page.strip.facts}
          tone={page.strip.tone}
        />
        {viewSwitch}
        {body}
      </Stack>
    </KkScreen>
  );
};
