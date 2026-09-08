import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { AppPageHeader, AppStageGreeting } from '@/features/session';

const OverviewComponent: FC = () => (
  <AppPageHeader>
    <AppStageGreeting />
  </AppPageHeader>
);

export const Route = createFileRoute('/_app/')({ component: OverviewComponent });
