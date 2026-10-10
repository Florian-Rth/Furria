import type { FC, ReactNode } from 'react';
import { KkNewsDate } from '../internal/news-surface/KkNewsDate';
import { KkNewsMeta } from '../internal/news-surface/KkNewsMeta';
import type { KkNewsCategory } from '../internal/news-surface/news-category';
import type { KkNewsFit } from '../internal/news-surface/news-fit';
import { fitted } from '../internal/news-surface/news-fit';
import type { KkNewsLink } from '../internal/news-surface/news-link';
import { KkNewsMedia } from '../KkNewsMedia';
import { kkTokens } from '../tokens';
import { KkNewsLeadMediaColumn } from './internal/layout/KkNewsLeadMediaColumn';
import { KkNewsLeadRoot } from './internal/layout/KkNewsLeadRoot';
import { KkNewsLeadTextColumn } from './internal/layout/KkNewsLeadTextColumn';
import { KkNewsLeadFooter } from './internal/ui/KkNewsLeadFooter';
import { KkNewsLeadHeadline } from './internal/ui/KkNewsLeadHeadline';
import { KkNewsLeadTeaser } from './internal/ui/KkNewsLeadTeaser';

interface KkNewsLeadProps {
  title: string | null;
  teaser: string | null;
  category: KkNewsCategory | null;
  date: string;
  photo: ReactNode;
  posterWord: string;
  readMoreLabel: string;
  readingTime: string | null;
  link?: KkNewsLink;
  fit?: KkNewsFit;
}

export const KkNewsLead: FC<KkNewsLeadProps> = ({
  title,
  teaser,
  category,
  date,
  photo,
  posterWord,
  readMoreLabel,
  readingTime,
  link,
  fit = 'page',
}) => {
  const label = title ?? '';
  const tone = category?.tone ?? null;
  const mediaSx = {
    aspectRatio: kkTokens.aspectRatio.banner,
    typography: fitted(fit, { xs: 'h1', md: 'display' }),
    border: kkTokens.line.hair,
    borderColor: 'divider',
    borderRadius: `${kkTokens.radius.base}px`,
  };

  return (
    <KkNewsLeadRoot label={label} link={link} fit={fit}>
      <KkNewsLeadMediaColumn fit={fit}>
        <KkNewsMedia photo={photo} tone={tone} posterWord={posterWord} sx={mediaSx} />
      </KkNewsLeadMediaColumn>
      <KkNewsLeadTextColumn fit={fit}>
        <KkNewsMeta category={category}>
          <KkNewsDate date={date} spacing="set" />
        </KkNewsMeta>
        <KkNewsLeadHeadline title={title} fit={fit} />
        <KkNewsLeadTeaser teaser={teaser} />
        <KkNewsLeadFooter readMoreLabel={readMoreLabel} readingTime={readingTime} fit={fit} />
      </KkNewsLeadTextColumn>
    </KkNewsLeadRoot>
  );
};
