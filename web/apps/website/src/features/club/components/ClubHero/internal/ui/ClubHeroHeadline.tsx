import { KkTwoToneHeadline } from '@furria/ui';
import type { FC } from 'react';
import { clubHeroHeadline } from '@/features/club/hero-content';

export const ClubHeroHeadline: FC = () => (
  <KkTwoToneHeadline line1={clubHeroHeadline.line1} line2={clubHeroHeadline.line2} posterShadow />
);
