import { KkNewsArticleHeader } from '@furria/ui/KkNewsArticleHeader';
import { KkNewsHero } from '@furria/ui/KkNewsHero';
import { NEWS_MENTION_KINDS } from '@furria/ui/news-mention-kinds';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { RichText } from '@/features/rich-text/components/RichText';
import { articleMentionCardsOf, bylineOf, readNewsCategoryOf } from '../read-news';
import type { ReadNewsArticle as Article } from '../schemas';
import { ReadNewsAlbumTie } from './ReadNewsAlbumTie';
import { ReadNewsEventTie } from './ReadNewsEventTie';
import { ReadNewsPhoto } from './ReadNewsPhoto';

const HERO_PHOTO_SIZES = '(min-width: 900px) 45rem, 100vw';

interface ReadNewsArticleProps {
  article: Article;
}

export const ReadNewsArticle: FC<ReadNewsArticleProps> = ({ article }) => {
  const category = readNewsCategoryOf(article.category);
  const byline = bylineOf(article);
  const mentionCards = articleMentionCardsOf(article);
  const photo = <ReadNewsPhoto picture={article.picture} sizes={HERO_PHOTO_SIZES} />;
  const hero =
    article.picture === null ? null : (
      <KkNewsHero photo={photo} caption={article.pictureCaption} fit="column" />
    );
  const eventTie = article.event === null ? null : <ReadNewsEventTie event={article.event} />;
  const albumTie = article.album === null ? null : <ReadNewsAlbumTie album={article.album} />;

  return (
    <Stack component="article" sx={{ rowGap: 3, minWidth: 0 }}>
      <KkNewsArticleHeader>
        <KkNewsArticleHeader.Meta category={category} byline={byline} />
        <KkNewsArticleHeader.Headline title={article.title} fit="column" />
        <KkNewsArticleHeader.Lead teaser={article.teaser} fit="column" />
      </KkNewsArticleHeader>
      {hero}
      <RichText text={article.text} mentionKinds={NEWS_MENTION_KINDS} cards={mentionCards} />
      {eventTie}
      {albumTie}
    </Stack>
  );
};
