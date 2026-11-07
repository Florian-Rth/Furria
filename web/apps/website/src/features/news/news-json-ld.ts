import { formatBerlinIsoWithOffset } from '@/lib/date';
import type { NewsArticle } from '@/lib/public-news/schemas';
import { absoluteUrlOf, SITE_NAME } from '@/lib/seo/route-head';
import { buildPostHref } from './news-content';

const SCHEMA_ORG = 'https://schema.org';

interface NewsArticleAuthorJsonLd {
  '@type': 'Person' | 'Organization';
  name: string;
  url?: string;
}

export interface NewsArticleJsonLd {
  '@context': typeof SCHEMA_ORG;
  '@type': 'NewsArticle';
  headline: string;
  description: string;
  datePublished: string;
  mainEntityOfPage: string;
  image?: string[];
  author: NewsArticleAuthorJsonLd;
  publisher: NewsArticleAuthorJsonLd;
}

const CLUB_AUTHOR: NewsArticleAuthorJsonLd = {
  '@type': 'Organization',
  name: SITE_NAME,
  url: absoluteUrlOf('/'),
};

const authorOf = (article: NewsArticle): NewsArticleAuthorJsonLd =>
  article.author === null
    ? CLUB_AUTHOR
    : { '@type': 'Person', name: `${article.author.firstName} ${article.author.lastName}` };

export const buildNewsArticleJsonLd = (article: NewsArticle): NewsArticleJsonLd => ({
  '@context': SCHEMA_ORG,
  '@type': 'NewsArticle',
  headline: article.title,
  description: article.teaser,
  datePublished: formatBerlinIsoWithOffset(article.publishedAt),
  mainEntityOfPage: absoluteUrlOf(buildPostHref(article)),
  ...(article.picture === null ? {} : { image: [absoluteUrlOf(article.picture.largeUrl)] }),
  author: authorOf(article),
  publisher: CLUB_AUTHOR,
});
