import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { PlaceholderPage } from '@/components/PlaceholderPage';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

const JoinComponent: FC = () => <PlaceholderPage title="Mitglied werden" />;

export const Route = createFileRoute('/_site/_gated/join')({
  head: (): RouteHead => ({ meta: [{ title: pageTitle('Mitglied werden') }] }),
  component: JoinComponent,
});
