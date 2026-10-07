import { KkScreen } from '@furria/ui';
import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { AREA_HANDOVERS, START_SECTION, START_TITLE } from '@/features/session';
import { StartBody, StartHeader } from '@/features/start';

const StartComponent: FC = () => (
  <KkScreen
    kind="overview"
    section={START_SECTION}
    title={START_TITLE}
    header={<StartHeader />}
    handover={AREA_HANDOVERS.start}
  >
    <StartBody />
  </KkScreen>
);

export const Route = createFileRoute('/_app/')({ component: StartComponent });
