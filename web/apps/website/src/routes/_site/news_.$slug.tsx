import { createFileRoute, redirect } from '@tanstack/react-router';
import type { FC } from 'react';
import { NewsPostPage } from '@/features/news/components/NewsPostPage/NewsPostPage';
import { NewsUnavailable } from '@/features/news/components/NewsUnavailable';
import { buildPostHref } from '@/features/news/news-content';
import { buildNewsArticleJsonLd } from '@/features/news/news-json-ld';
import { formatBerlinIsoWithOffset } from '@/lib/date';
import { publicNews } from '@/lib/public-news/api';
import type { NewsArticle } from '@/lib/public-news/schemas';
import { loadCanonicalDetail } from '@/lib/public-resource/canonical-detail';
import { useRouteRetry } from '@/lib/public-resource/use-route-retry';
import type { RouteHead } from '@/lib/seo/route-head';
import { indexablePageHead, jsonLdScript, pageTitle, shareImageMeta } from '@/lib/seo/route-head';

const NewsPostComponent: FC = () => <NewsPostPage article={Route.useLoaderData()} />;

const NewsPostErrorComponent: FC = () => {
  const retry = useRouteRetry();

  return <NewsUnavailable onRetry={retry} />;
};

const buildShareImageMeta = (article: NewsArticle): RouteHead['meta'] =>
  article.picture === null ? [] : shareImageMeta(article.picture.largeUrl, article.title);

const buildPostHead = (article: NewsArticle): RouteHead => {
  const head = indexablePageHead({
    path: buildPostHref(article),
    title: pageTitle(article.title),
    description: article.teaser,
  });

  return {
    ...head,
    meta: [
      ...head.meta,
      { property: 'og:type', content: 'article' },
      {
        property: 'article:published_time',
        content: formatBerlinIsoWithOffset(article.publishedAt),
      },
      ...buildShareImageMeta(article),
    ],
    scripts: [jsonLdScript(buildNewsArticleJsonLd(article))],
  };
};

export const Route = createFileRoute('/_site/news_/$slug')({
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
