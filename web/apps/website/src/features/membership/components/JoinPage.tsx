import { PageLayout } from '@furria/ui';
import type { FC } from 'react';
import { JoinHero } from './JoinHero/JoinHero';

export const JoinPage: FC = () => (
  <PageLayout>
    <PageLayout.Body>
      <JoinHero />
    </PageLayout.Body>
  </PageLayout>
);
