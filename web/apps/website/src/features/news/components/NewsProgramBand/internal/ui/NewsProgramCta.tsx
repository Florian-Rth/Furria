import type { FC } from 'react';
import { BandCta } from '@/components/BandCta';
import { newsProgramBandContent } from '@/features/news/news-content';

export const NewsProgramCta: FC = () => (
  <BandCta to={newsProgramBandContent.ctaTo} emphasis="outlined">
    {newsProgramBandContent.ctaLabel}
  </BandCta>
);
