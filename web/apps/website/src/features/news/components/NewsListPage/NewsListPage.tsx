import { KkRule, KkSection, PageLayout } from '@furria/ui';
import type { FC } from 'react';
import { NewsHeader } from '@/features/news/components/NewsHeader/NewsHeader';
import { NewsLead } from '@/features/news/components/NewsLead';
import { arrangeNewsFront, moreNewsLabel } from '@/features/news/news-content';
import type { NewsSection } from '@/lib/public-news/schemas';
import { NewsEventsBand } from '../NewsEventsBand/NewsEventsBand';
import { NewsRowList } from './internal/layout/NewsRowList';
import { NewsEmptyPanel } from './internal/ui/NewsEmptyPanel';
import { NewsRow } from './internal/ui/NewsRow';
import { NewsSessionSection } from './internal/ui/NewsSessionSection';

interface NewsListPageProps {
  sections: NewsSection[];
}

export const NewsListPage: FC<NewsListPageProps> = ({ sections }) => {
  const front = arrangeNewsFront(sections);

  return (
    <PageLayout>
      <PageLayout.Body>
        <NewsHeader />
        <KkRule />
        {front === null ? (
          <NewsEmptyPanel />
        ) : (
          <>
            <NewsLead post={front.lead} />
            {front.following.length > 0 && (
              <KkSection>
                <KkSection.Header title={moreNewsLabel} />
                <NewsRowList>
                  {front.following.map((post) => (
                    <NewsRow key={post.slug} post={post} />
                  ))}
                </NewsRowList>
              </KkSection>
            )}
            {front.olderSections.map((section) => (
              <NewsSessionSection key={section.session.startYear} section={section} />
            ))}
          </>
        )}
      </PageLayout.Body>
      <NewsEventsBand />
    </PageLayout>
  );
};
