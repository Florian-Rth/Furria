import { KkNewsText, PageLayout } from '@furria/ui';
import type { FC } from 'react';
import { newTabNote } from '@/features/news/news-content';
import { collectMentionCards } from '@/features/news/news-mentions';
import type { NewsArticle } from '@/lib/public-news/schemas';
import { NewsRelated } from '../NewsRelated/NewsRelated';
import { NewsPostHeader } from './internal/layout/NewsPostHeader';
import { NewsShareRow } from './internal/layout/NewsShareRow';
import { NewsTies } from './internal/layout/NewsTies';
import { NewsMentionContext } from './internal/logic/news-mention-context';
import { NewsAlbumTie } from './internal/ui/NewsAlbumTie';
import { NewsCopyLinkButton } from './internal/ui/NewsCopyLinkButton';
import { NewsEventTie } from './internal/ui/NewsEventTie';
import { NewsMention } from './internal/ui/NewsMention';
import { NewsPostBackLink } from './internal/ui/NewsPostBackLink';
import { NewsPostHeadline } from './internal/ui/NewsPostHeadline';
import { NewsPostHero } from './internal/ui/NewsPostHero';
import { NewsPostLead } from './internal/ui/NewsPostLead';
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
        <NewsPostHeader>
          <NewsPostBackLink />
          <NewsPostMeta article={article} />
          <NewsPostHeadline post={article} />
          <NewsPostLead post={article} />
        </NewsPostHeader>
        <NewsPostHero article={article} />
        <NewsMentionContext value={mentionCards}>
          <KkNewsText text={article.text} newTabNote={newTabNote} mentionView={NewsMention} />
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
