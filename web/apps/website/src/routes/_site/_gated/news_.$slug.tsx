import { createFileRoute, redirect } from '@tanstack/react-router';
import type { FC } from 'react';
import { buildPostHref, NewsPostPage, NewsUnavailable } from '@/features/news';
import { formatBerlinIsoWithOffset } from '@/lib/date';
import { publicNews } from '@/lib/public-news/api';
import type { NewsArticle } from '@/lib/public-news/schemas';
import { loadCanonicalDetail } from '@/lib/public-resource/canonical-detail';
import { useRouteRetry } from '@/lib/public-resource/use-route-retry';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

const NewsPostComponent: FC = () => <NewsPostPage article={Route.useLoaderData()} />;

const NewsPostErrorComponent: FC = () => {
  const retry = useRouteRetry();

  return <NewsUnavailable onRetry={retry} />;
};

const buildShareImageMeta = (article: NewsArticle): RouteHead['meta'] =>
  article.picture === null ? [] : [{ property: 'og:image', content: article.picture.largeUrl }];

const buildPostHead = (article: NewsArticle): RouteHead => {
  const title = pageTitle(article.title);

  return {
    meta: [
      { title },
      { name: 'description', content: article.teaser },
      { property: 'og:title', content: title },
      { property: 'og:description', content: article.teaser },
      { property: 'og:type', content: 'article' },
      {
        property: 'article:published_time',
        content: formatBerlinIsoWithOffset(article.publishedAt),
      },
      ...buildShareImageMeta(article),
    ],
    links: [{ rel: 'canonical', href: buildPostHref(article) }],
  };
};

export const Route = createFileRoute('/_site/_gated/news_/$slug')({
  loader: ({ params }): Promise<NewsArticle> => {
    void publicNews.ensure().catch((): null => null);

    return loadCanonicalDetail(publicNews, params.slug, (slug) =>
      redirect({ to: '/news/$slug', params: { slug }, replace: true }),
    );
  },
  head: ({ loaderData }): RouteHead =>
    loaderData === undefined ? { meta: [] } : buildPostHead(loaderData),
  errorComponent: NewsPostErrorComponent,
  component: NewsPostComponent,
});
