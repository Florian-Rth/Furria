import { KkPageWatermark, KkScreen } from '@furria/ui';
import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { AppStageGreeting, AREA_HANDOVERS, OVERVIEW_SECTION } from '@/features/session';
import { toSessionThread } from '@/lib/session-thread';

const OVERVIEW_TITLE = 'Übersicht';

const OverviewComponent: FC = () => {
  const thread = toSessionThread(new Date());

  return (
    <KkScreen
      kind="overview"
      section={OVERVIEW_SECTION}
      title={OVERVIEW_TITLE}
      header={<AppStageGreeting />}
      handover={AREA_HANDOVERS.overview}
      thread={thread}
    >
      <KkPageWatermark />
    </KkScreen>
  );
};

export const Route = createFileRoute('/_app/')({ component: OverviewComponent });
