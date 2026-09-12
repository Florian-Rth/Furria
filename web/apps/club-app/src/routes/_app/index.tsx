import { KkPageWatermark } from '@furria/ui';
import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { AppPageHeader, AppStageGreeting } from '@/features/session';

const OverviewComponent: FC = () => (
  <>
    <AppPageHeader>
      <AppStageGreeting />
    </AppPageHeader>
    <KkPageWatermark />
  </>
);

export const Route = createFileRoute('/_app/')({ component: OverviewComponent });
