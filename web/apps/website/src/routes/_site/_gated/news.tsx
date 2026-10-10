import { createFileRoute } from '@tanstack/react-router';
import { NewsScreen } from '@/features/news';
import { ensurePublicNews } from '@/lib/public-news/api';
import type { NewsSection } from '@/lib/public-news/schemas';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

const NEWS_TITLE = pageTitle('Aktuelles');
const NEWS_DESCRIPTION =
  'Aktuelles vom Furrschen Carnevals Club e.V. — Motto-Verkündung, Erfolge der Garden, Aufrufe zum Mitmachen und alles, was Großfurra zwischen den Veranstaltungen wissen sollte.';

export const Route = createFileRoute('/_site/_gated/news')({
  loader: (): Promise<NewsSection[] | null> => ensurePublicNews().catch((): null => null),
  head: (): RouteHead => ({
    meta: [
      { title: NEWS_TITLE },
      { name: 'description', content: NEWS_DESCRIPTION },
      { property: 'og:title', content: NEWS_TITLE },
      { property: 'og:description', content: NEWS_DESCRIPTION },
    ],
  }),
  component: NewsScreen,
});
