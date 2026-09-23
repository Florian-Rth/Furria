import type { FC } from 'react';
import { BandCta } from '@/components/BandCta';
import { joinInBandContent } from '@/features/landing/join-in-content';

export const JoinInCta: FC = () => <BandCta to="/join">{joinInBandContent.ctaLabel}</BandCta>;
