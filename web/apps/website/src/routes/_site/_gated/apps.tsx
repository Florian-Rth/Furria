import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { DevHomePage } from '@/features/dev-home';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

const AppsComponent: FC = () => <DevHomePage />;

export const Route = createFileRoute('/_site/_gated/apps')({
  head: (): RouteHead => ({ meta: [{ title: pageTitle('Interner Testbereich') }] }),
  component: AppsComponent,
});
