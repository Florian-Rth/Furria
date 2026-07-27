import { KkHeroSection } from '@furria/ui';
import type { FC } from 'react';
import { newsDescription, newsEyebrow, newsHeading } from '@/features/news/news-content';
import { NewsHeroMark } from './internal/ui/NewsHeroMark';

export const NewsHeader: FC = () => (
  <KkHeroSection>
    <KkHeroSection.Main>
      <KkHeroSection.Eyebrow>{newsEyebrow}</KkHeroSection.Eyebrow>
      <KkHeroSection.Title>{newsHeading}</KkHeroSection.Title>
      <KkHeroSection.Description>{newsDescription}</KkHeroSection.Description>
    </KkHeroSection.Main>
    <KkHeroSection.Aside>
      <NewsHeroMark />
    </KkHeroSection.Aside>
  </KkHeroSection>
);
