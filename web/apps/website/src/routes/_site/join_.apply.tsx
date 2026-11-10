import { createFileRoute } from '@tanstack/react-router';
import { ApplyPage } from '@/features/membership/components/ApplyPage';
import type { RouteHead } from '@/lib/seo/route-head';
import { indexablePageHead } from '@/lib/seo/route-head';
import { STATIC_PAGES } from '@/lib/seo/static-pages';

export const Route = createFileRoute('/_site/join_/apply')({
  head: (): RouteHead => indexablePageHead(STATIC_PAGES.joinApply),
  component: ApplyPage,
});
