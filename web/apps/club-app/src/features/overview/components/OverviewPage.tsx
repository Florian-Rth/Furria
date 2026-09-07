import { KkAppShell } from '@furria/ui';
import type { FC } from 'react';
import { OverviewBody } from './OverviewBody';

export const OverviewPage: FC = () => (
  <>
    <KkAppShell.PageHeader title="ÜBERSICHT" sub="Dein Zugang zur Club-App." />
    <OverviewBody />
  </>
);
