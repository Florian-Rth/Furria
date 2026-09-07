import { KkTwoToneHeadline, PageLayout } from '@furria/ui';
import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';

const OverviewComponent: FC = () => (
  <PageLayout>
    <PageLayout.Body>
      <KkTwoToneHeadline line1="FURRIA" line2="CLUB-APP" />
    </PageLayout.Body>
  </PageLayout>
);

export const Route = createFileRoute('/')({ component: OverviewComponent });
