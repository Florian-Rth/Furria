import type { FC } from 'react';
import { NotFoundPage } from '@/components/NotFoundPage';
import { SiteChrome } from '@/components/SiteChrome';

export const NotFoundScreen: FC = () => (
  <SiteChrome>
    <NotFoundPage />
  </SiteChrome>
);
