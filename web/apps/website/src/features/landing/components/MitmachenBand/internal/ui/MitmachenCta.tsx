import type { FC } from 'react';
import { BandCta } from '@/components/BandCta';
import { mitmachenBandContent } from '@/features/landing/mitmachen-content';

export const MitmachenCta: FC = () => <BandCta to="/join">{mitmachenBandContent.ctaLabel}</BandCta>;
