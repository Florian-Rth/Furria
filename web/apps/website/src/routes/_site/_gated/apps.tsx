import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { DevHomePage } from '@/features/dev-home';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

// The tester portal: launch links into the three apps. Unlocking redirects here.
const AppsComponent: FC = () => <DevHomePage />;

export const Route = createFileRoute('/_site/_gated/apps')({
  head: (): RouteHead => ({ meta: [{ title: pageTitle('Interner Testbereich') }] }),
  component: AppsComponent,
});
