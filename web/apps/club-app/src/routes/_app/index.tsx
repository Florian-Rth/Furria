import { KkScreen } from '@furria/ui';
import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { AREA_HANDOVERS, START_SECTION, START_TITLE } from '@/features/session';
import { StartBody, StartGreeting } from '@/features/start';

const StartComponent: FC = () => (
  <KkScreen
    kind="overview"
    section={START_SECTION}
    title={START_TITLE}
    header={<StartGreeting />}
    handover={AREA_HANDOVERS.start}
  >
    <StartBody />
  </KkScreen>
);

export const Route = createFileRoute('/_app/')({ component: StartComponent });
