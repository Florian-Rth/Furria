import type { FC } from 'react';
import type { KkImageSource } from '../image-source';
import type { KkGroupTone } from '../internal/group-tone';
import type { KkNewsLink } from '../internal/news-surface/news-link';
import { KkCard } from '../KkCard/KkCard';
import { KkEventPicture } from '../KkEventPicture/KkEventPicture';
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
  image: KkImageSource | null;
  tone: KkGroupTone;
  cancelledLabel?: string | null;
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
  image,
  tone,
  cancelledLabel = null,
  sx,
}) => {
  const media = (
    <KkCard.Media>
      <KkEventPicture image={image} tone={tone} cancelledLabel={cancelledLabel} />
    </KkCard.Media>
  );

  return (
    <KkNewsTieFrame label={title} link={link} media={media} sx={sx}>
      <KkEyebrow>{eyebrow}</KkEyebrow>
      <KkEventTie day={day} month={month} title={title} line={line} wrapsLine />
      <KkNewsTieCta label={ctaLabel} />
    </KkNewsTieFrame>
  );
};
