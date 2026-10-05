import { KkScreen } from '@furria/ui';
import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { AREA_HANDOVERS, OVERVIEW_SECTION, OVERVIEW_TITLE } from '@/features/session';
import { StartBody, StartGreeting } from '@/features/start';

const StartComponent: FC = () => (
  <KkScreen
    kind="overview"
    section={OVERVIEW_SECTION}
    title={OVERVIEW_TITLE}
    header={<StartGreeting />}
    handover={AREA_HANDOVERS.overview}
  >
    <StartBody />
  </KkScreen>
);

export const Route = createFileRoute('/_app/')({ component: StartComponent });
