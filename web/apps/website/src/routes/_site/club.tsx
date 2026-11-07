import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { ClubPage } from '@/features/club/components/ClubPage';
import { ClubSearchSchema } from '@/features/club/schemas';
import type { RouteHead } from '@/lib/seo/route-head';
import { indexablePageHead } from '@/lib/seo/route-head';
import { STATIC_PAGES } from '@/lib/seo/static-pages';

const ClubComponent: FC = () => <ClubPage />;

export const Route = createFileRoute('/_site/club')({
  validateSearch: ClubSearchSchema,
  head: (): RouteHead => indexablePageHead(STATIC_PAGES.club),
  component: ClubComponent,
});
