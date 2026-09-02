import type { FC } from 'react';
import { BandCta } from '@/components/BandCta';
import { newsEventsBandContent } from '@/features/news/news-content';

export const NewsEventsCta: FC = () => (
  <BandCta to={newsEventsBandContent.ctaTo} emphasis="outlined">
    {newsEventsBandContent.ctaLabel}
  </BandCta>
);
