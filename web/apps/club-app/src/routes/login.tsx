import { KkTwoToneHeadline, PageLayout } from '@furria/ui';
import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';

const LoginComponent: FC = () => (
  <PageLayout>
    <PageLayout.Body>
      <KkTwoToneHeadline line1="FURRIA" line2="ANMELDEN" />
    </PageLayout.Body>
  </PageLayout>
);

export const Route = createFileRoute('/login')({ component: LoginComponent });
