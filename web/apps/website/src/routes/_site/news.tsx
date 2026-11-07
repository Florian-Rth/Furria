import { createFileRoute } from '@tanstack/react-router';
import { NewsScreen } from '@/features/news/components/NewsScreen';
import { publicNews } from '@/lib/public-news/api';
import type { NewsSection } from '@/lib/public-news/schemas';
import type { RouteHead } from '@/lib/seo/route-head';
import { indexablePageHead } from '@/lib/seo/route-head';
import { STATIC_PAGES } from '@/lib/seo/static-pages';

export const Route = createFileRoute('/_site/news')({
  loader: (): Promise<NewsSection[] | null> => publicNews.ensure().catch((): null => null),
  head: (): RouteHead => indexablePageHead(STATIC_PAGES.news),
  component: NewsScreen,
});
