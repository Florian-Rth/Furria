import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { NEWS_POSTS, NewsListPage } from '@/features/news';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

const NEWS_TITLE = pageTitle('Aktuelles');
const NEWS_DESCRIPTION =
  'Aktuelles vom Furrschen Carnevals Club e.V. — Motto-Verkündung, Erfolge der Garden, Aufrufe zum Mitmachen und alles, was Großfurra zwischen den Veranstaltungen wissen sollte.';

const NewsComponent: FC = () => <NewsListPage posts={NEWS_POSTS} />;

export const Route = createFileRoute('/_site/_gated/news')({
  head: (): RouteHead => ({
    meta: [
      { title: NEWS_TITLE },
      { name: 'description', content: NEWS_DESCRIPTION },
      { property: 'og:title', content: NEWS_TITLE },
      { property: 'og:description', content: NEWS_DESCRIPTION },
    ],
  }),
  component: NewsComponent,
});
