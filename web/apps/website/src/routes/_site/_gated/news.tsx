import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { PlaceholderPage } from '@/components/PlaceholderPage';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

const NewsComponent: FC = () => <PlaceholderPage title="Aktuelles" />;

export const Route = createFileRoute('/_site/_gated/news')({
  head: (): RouteHead => ({ meta: [{ title: pageTitle('Aktuelles') }] }),
  component: NewsComponent,
});
