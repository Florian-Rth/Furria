import type { FC, ReactNode } from 'react';
import { KkNewsDate } from '../internal/news-surface/KkNewsDate';
import { KkNewsMeta } from '../internal/news-surface/KkNewsMeta';
import type { KkNewsCategory } from '../internal/news-surface/news-category';
import type { KkNewsFit } from '../internal/news-surface/news-fit';
import { fitted } from '../internal/news-surface/news-fit';
import type { KkNewsLink } from '../internal/news-surface/news-link';
import { KkNewsMedia } from '../KkNewsMedia';
import { kkTokens } from '../tokens';
import { KkNewsRowRoot } from './internal/layout/KkNewsRowRoot';
import { KkNewsRowText } from './internal/layout/KkNewsRowText';
import { KkNewsRowDateMark } from './internal/ui/KkNewsRowDateMark';
import { KkNewsRowHeadline } from './internal/ui/KkNewsRowHeadline';
import { KkNewsRowTeaser } from './internal/ui/KkNewsRowTeaser';

interface KkNewsRowProps {
  title: string | null;
  teaser: string | null;
  category: KkNewsCategory | null;
  shortDate: string;
  longDate: string;
  photo: ReactNode;
  posterWord: string;
  link?: KkNewsLink;
  fit?: KkNewsFit;
}

export const KkNewsRow: FC<KkNewsRowProps> = ({
  title,
  teaser,
  category,
  shortDate,
  longDate,
  photo,
  posterWord,
  link,
  fit = 'page',
}) => {
  const label = title ?? '';
  const tone = category?.tone ?? null;
  const longDateSx = { display: fitted(fit, { xs: 'block', desktop: 'none' }) };
  const mediaSx = {
    flexShrink: 0,
    width: fitted(fit, { xs: '4.5rem', md: '10.5rem' }),
    height: fitted(fit, { xs: '4.5rem', md: '6.5rem' }),
    typography: fitted(fit, { xs: 'body2', md: 'h3' }),
    border: 1,
    borderColor: 'divider',
    borderRadius: `${kkTokens.radius.base}px`,
  };

  return (
    <KkNewsRowRoot label={label} link={link} fit={fit}>
      <KkNewsRowDateMark date={shortDate} fit={fit} />
      <KkNewsRowText fit={fit}>
        <KkNewsMeta category={category}>
          <KkNewsDate date={longDate} spacing="set" sx={longDateSx} />
        </KkNewsMeta>
        <KkNewsRowHeadline title={title} fit={fit} />
        <KkNewsRowTeaser teaser={teaser} />
      </KkNewsRowText>
      <KkNewsMedia photo={photo} tone={tone} posterWord={posterWord} sx={mediaSx} />
    </KkNewsRowRoot>
  );
};
