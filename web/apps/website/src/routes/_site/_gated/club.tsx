import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { PlaceholderPage } from '@/components/PlaceholderPage';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

const ClubComponent: FC = () => <PlaceholderPage title="Verein" />;

export const Route = createFileRoute('/_site/_gated/club')({
  head: (): RouteHead => ({ meta: [{ title: pageTitle('Verein') }] }),
  component: ClubComponent,
});
