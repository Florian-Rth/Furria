import { PageLayout } from '@furria/ui';
import type { FC, PropsWithChildren } from 'react';
import { JoinHero } from './JoinHero/JoinHero';

export const JoinPage: FC<PropsWithChildren> = ({ children }) => (
  <PageLayout>
    <PageLayout.Body>
      <JoinHero />
      {children}
    </PageLayout.Body>
  </PageLayout>
);
