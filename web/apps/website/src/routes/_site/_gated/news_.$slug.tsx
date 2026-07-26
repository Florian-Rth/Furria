import { createFileRoute, notFound } from '@tanstack/react-router';
import type { FC } from 'react';
import type { NewsPost } from '@/features/news';
import { buildPostHref, findPostBySlug, NEWS_POSTS, NewsPostPage } from '@/features/news';
import type { RouteHead } from '@/lib/seo';
import { pageTitle } from '@/lib/seo';

const NewsPostComponent: FC = () => <NewsPostPage post={Route.useLoaderData()} />;

const buildPostHead = (post: NewsPost): RouteHead => {
  const title = pageTitle(post.title);

  return {
    meta: [
      { title },
      { name: 'description', content: post.teaser },
      { property: 'og:title', content: title },
      { property: 'og:description', content: post.teaser },
      { property: 'og:type', content: 'article' },
      { property: 'article:published_time', content: post.publishedAt },
    ],
    links: [{ rel: 'canonical', href: buildPostHref(post.slug) }],
  };
};

export const Route = createFileRoute('/_site/_gated/news_/$slug')({
  loader: ({ params }): NewsPost => {
    const post = findPostBySlug(NEWS_POSTS, params.slug);
    if (post === undefined) {
      throw notFound();
    }
    return post;
  },
  head: ({ loaderData }): RouteHead =>
    loaderData === undefined ? { meta: [] } : buildPostHead(loaderData),
  component: NewsPostComponent,
});
