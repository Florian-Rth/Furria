import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { PlaceholderPage } from '@/components/PlaceholderPage';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

const ProgramComponent: FC = () => <PlaceholderPage title="Programm" />;

export const Route = createFileRoute('/_site/_gated/program')({
  head: (): RouteHead => ({ meta: [{ title: pageTitle('Programm') }] }),
  component: ProgramComponent,
});
