import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { LandingPage } from '@/features/landing/components/LandingPage';
import { NewsTeaser } from '@/features/news/components/NewsTeaser/NewsTeaser';
import { publicClub } from '@/lib/public-club/api';
import type { PublicClub } from '@/lib/public-club/schemas';
import type { RouteHead } from '@/lib/seo/route-head';
import { indexablePageHead, jsonLdScript } from '@/lib/seo/route-head';
import { buildOrganizationJsonLd, WEBSITE_JSON_LD } from '@/lib/seo/site-json-ld';
import { STATIC_PAGES } from '@/lib/seo/static-pages';

const HomeComponent: FC = () => <LandingPage newsTeaser={<NewsTeaser />} />;

export const Route = createFileRoute('/_site/')({
  loader: (): Promise<PublicClub | null> => publicClub.ensure().catch((): null => null),
  head: ({ loaderData }): RouteHead => ({
    ...indexablePageHead(STATIC_PAGES.home),
    scripts: [
      jsonLdScript(WEBSITE_JSON_LD),
      jsonLdScript(buildOrganizationJsonLd(loaderData ?? null)),
    ],
  }),
  component: HomeComponent,
});
