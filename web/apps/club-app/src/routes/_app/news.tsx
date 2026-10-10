import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { NewsHubPage } from '@/features/news';
import {
  MORE_SECTION,
  NEWS_KEYS,
  NEWS_TITLE,
  RequireAnyScreenPermission,
} from '@/features/session';

const NewsRoute: FC = () => (
  <RequireAnyScreenPermission permissionKeys={NEWS_KEYS} title={NEWS_TITLE} section={MORE_SECTION}>
    <NewsHubPage />
  </RequireAnyScreenPermission>
);

export const Route = createFileRoute('/_app/news')({ component: NewsRoute });
