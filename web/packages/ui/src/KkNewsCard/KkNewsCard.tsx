import type { FC, ReactNode } from 'react';
import { KkNewsCopy } from '../internal/news-surface/KkNewsCopy';
import { KkNewsCutWatch } from '../internal/news-surface/KkNewsCutWatch';
import { KkNewsDate } from '../internal/news-surface/KkNewsDate';
import type { KkNewsCategory } from '../internal/news-surface/news-category';
import type { KkNewsFit } from '../internal/news-surface/news-fit';
import { fitted } from '../internal/news-surface/news-fit';
import type { KkNewsLink } from '../internal/news-surface/news-link';
import { KkCard } from '../KkCard/KkCard';
import { KkNewsCategoryChip } from '../KkNewsCategoryChip';
import { KkNewsMedia } from '../KkNewsMedia';
import type { KkSx } from '../kk-sx';
import { KkNewsCardFace } from './internal/layout/KkNewsCardFace';

const TITLE_LINES = 3;
const TEASER_LINES = 2;

interface KkNewsCardProps {
  title: string | null;
  teaser: string | null;
  category: KkNewsCategory | null;
  date: string;
  photo: ReactNode;
  posterWord: string;
  link?: KkNewsLink;
  fit?: KkNewsFit;
  sx?: KkSx;
}

export const KkNewsCard: FC<KkNewsCardProps> = ({
  title,
  teaser,
  category,
  date,
  photo,
  posterWord,
  link,
  fit = 'page',
  sx,
}) => {
  const label = title ?? '';
  const tone = category?.tone ?? null;
  const mediaSx = { height: '100%', typography: fitted(fit, { xs: 'h3', md: 'h2' }) };
  const chip =
    category === null ? null : <KkNewsCategoryChip tone={category.tone} label={category.label} />;

  return (
    <KkCard sx={sx}>
      <KkNewsCardFace label={label} link={link}>
        <KkCard.Media>
          <KkNewsMedia photo={photo} tone={tone} posterWord={posterWord} sx={mediaSx} />
        </KkCard.Media>
        <KkCard.Body>
          <KkCard.Meta>
            {chip}
            <KkNewsDate date={date} spacing="tracked" />
          </KkCard.Meta>
          <KkNewsCutWatch>
            <KkCard.Title clamp={TITLE_LINES}>
              <KkNewsCopy text={title} kind="title" />
            </KkCard.Title>
          </KkNewsCutWatch>
          <KkNewsCutWatch>
            <KkCard.Text clamp={TEASER_LINES}>
              <KkNewsCopy text={teaser} kind="teaser" />
            </KkCard.Text>
          </KkNewsCutWatch>
        </KkCard.Body>
      </KkNewsCardFace>
    </KkCard>
  );
};
