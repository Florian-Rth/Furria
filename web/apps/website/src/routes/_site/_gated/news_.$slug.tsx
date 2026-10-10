import { createFileRoute, notFound, useRouter } from '@tanstack/react-router';
import type { FC } from 'react';
import { buildPostHref, NewsPostPage, NewsUnavailable } from '@/features/news';
import { ApiError } from '@/lib/api/errors';
import { formatBerlinIsoWithOffset } from '@/lib/date';
import { ensurePublicNews, ensurePublicNewsArticle } from '@/lib/public-news/api';
import type { NewsArticle } from '@/lib/public-news/schemas';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

const NOT_FOUND_STATUS = 404;

const NewsPostComponent: FC = () => <NewsPostPage article={Route.useLoaderData()} />;

const NewsPostErrorComponent: FC = () => {
  const router = useRouter();

  const retry = (): void => {
    void router.invalidate();
  };

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
    links: [{ rel: 'canonical', href: buildPostHref(article.slug) }],
  };
};

const loadArticle = async (slug: string): Promise<NewsArticle> => {
  try {
    return await ensurePublicNewsArticle(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === NOT_FOUND_STATUS) {
      throw notFound();
    }
    throw error;
  }
};

export const Route = createFileRoute('/_site/_gated/news_/$slug')({
  loader: ({ params }): Promise<NewsArticle> => {
    void ensurePublicNews().catch((): null => null);
    return loadArticle(params.slug);
  },
  head: ({ loaderData }): RouteHead =>
    loaderData === undefined ? { meta: [] } : buildPostHead(loaderData),
  errorComponent: NewsPostErrorComponent,
  component: NewsPostComponent,
});
