import type { FC } from 'react';
import { BandCta } from '@/components/BandCta';
import { joinClosingBandContent } from '@/features/membership/closing-content';

export const JoinClosingCta: FC = () => (
  <BandCta to={joinClosingBandContent.ctaHref}>{joinClosingBandContent.ctaLabel}</BandCta>
);
