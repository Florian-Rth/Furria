import type { FC } from 'react';
import type { KkNewsLink } from '../internal/news-surface/news-link';
import { KkEventTie } from '../KkEventTie';
import { KkEyebrow } from '../KkEyebrow';
import type { KkSx } from '../kk-sx';
import { KkNewsTieFrame } from './internal/layout/KkNewsTieFrame';
import { KkNewsTieCta } from './internal/ui/KkNewsTieCta';

interface KkNewsEventCardProps {
  eyebrow: string;
  day: string;
  month: string;
  title: string;
  line: string;
  ctaLabel: string;
  link: KkNewsLink;
  sx?: KkSx;
}

export const KkNewsEventCard: FC<KkNewsEventCardProps> = ({
  eyebrow,
  day,
  month,
  title,
  line,
  ctaLabel,
  link,
  sx,
}) => (
  <KkNewsTieFrame label={title} link={link} sx={sx}>
    <KkEyebrow>{eyebrow}</KkEyebrow>
    <KkEventTie day={day} month={month} title={title} line={line} wrapsLine />
    <KkNewsTieCta label={ctaLabel} />
  </KkNewsTieFrame>
);
