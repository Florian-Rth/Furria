import { KkNewsArticleHeader } from '@furria/ui/KkNewsArticleHeader';
import { KkRichText } from '@furria/ui/KkRichText';
import { NEWS_MENTION_KINDS } from '@furria/ui/news-mention-kinds';
import { PageLayout } from '@furria/ui/PageLayout';
import type { FC } from 'react';
import { newTabNote } from '@/features/news/news-content';
import { collectMentionCards } from '@/features/news/news-mentions';
import type { NewsArticle } from '@/lib/public-news/schemas';
import { NewsRelated } from '../NewsRelated/NewsRelated';
import { NewsShareRow } from './internal/layout/NewsShareRow';
import { NewsTies } from './internal/layout/NewsTies';
import { NewsMentionContext } from './internal/logic/news-mention-context';
import { NewsAlbumTie } from './internal/ui/NewsAlbumTie';
import { NewsCopyLinkButton } from './internal/ui/NewsCopyLinkButton';
import { NewsEventTie } from './internal/ui/NewsEventTie';
import { NewsMention } from './internal/ui/NewsMention';
import { NewsPostBackLink } from './internal/ui/NewsPostBackLink';
import { NewsPostHero } from './internal/ui/NewsPostHero';
import { NewsPostMeta } from './internal/ui/NewsPostMeta';
import { NewsShareLabel } from './internal/ui/NewsShareLabel';
import { NewsWhatsAppShareButton } from './internal/ui/NewsWhatsAppShareButton';

interface NewsPostPageProps {
  article: NewsArticle;
}

export const NewsPostPage: FC<NewsPostPageProps> = ({ article }) => {
  const mentionCards = collectMentionCards(article);
  const eventTie = article.event === null ? null : <NewsEventTie event={article.event} />;
  const albumTie = article.album === null ? null : <NewsAlbumTie album={article.album} />;
  const ties =
    eventTie === null && albumTie === null ? null : (
      <NewsTies>
        {eventTie}
        {albumTie}
      </NewsTies>
    );

  return (
    <PageLayout>
      <PageLayout.Prose>
        <KkNewsArticleHeader>
          <NewsPostBackLink />
          <NewsPostMeta article={article} />
          <KkNewsArticleHeader.Headline title={article.title} />
          <KkNewsArticleHeader.Lead teaser={article.teaser} />
        </KkNewsArticleHeader>
        <NewsPostHero article={article} />
        <NewsMentionContext value={mentionCards}>
          <KkRichText
            text={article.text}
            mentionKinds={NEWS_MENTION_KINDS}
            newTabNote={newTabNote}
            mentionView={NewsMention}
          />
        </NewsMentionContext>
        {ties}
        <NewsShareRow>
          <NewsShareLabel />
          <NewsWhatsAppShareButton post={article} />
          <NewsCopyLinkButton />
        </NewsShareRow>
        <NewsRelated currentSlug={article.slug} />
      </PageLayout.Prose>
    </PageLayout>
  );
};
