import { KkNewsArticleHeaderRoot } from './internal/layout/KkNewsArticleHeaderRoot';
import { KkNewsArticleHeadline } from './internal/ui/KkNewsArticleHeadline';
import { KkNewsArticleLead } from './internal/ui/KkNewsArticleLead';
import { KkNewsArticleMeta } from './internal/ui/KkNewsArticleMeta';

export const KkNewsArticleHeader = Object.assign(KkNewsArticleHeaderRoot, {
  Meta: KkNewsArticleMeta,
  Headline: KkNewsArticleHeadline,
  Lead: KkNewsArticleLead,
});
