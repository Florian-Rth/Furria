import { KkSection } from '@furria/ui';
import type { FC } from 'react';
import { buildSessionLabel } from '@/features/news/news-content';
import type { NewsSection } from '@/lib/public-news/schemas';
import { NewsRowList } from '../layout/NewsRowList';
import { NewsRow } from './NewsRow';

interface NewsSessionSectionProps {
  section: NewsSection;
}

export const NewsSessionSection: FC<NewsSessionSectionProps> = ({ section }) => (
  <KkSection>
    <KkSection.Header title={buildSessionLabel(section.session)} />
    <NewsRowList>
      {section.posts.map((post) => (
        <NewsRow key={post.slug} post={post} />
      ))}
    </NewsRowList>
  </KkSection>
);
