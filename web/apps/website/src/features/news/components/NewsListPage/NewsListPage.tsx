import { KkNewsRowList } from '@furria/ui/KkNewsRowList';
import { KkRule } from '@furria/ui/KkRule';
import { KkSection } from '@furria/ui/KkSection';
import { PageLayout } from '@furria/ui/PageLayout';
import type { FC } from 'react';
import { NewsHeader } from '@/features/news/components/NewsHeader/NewsHeader';
import { NewsLead } from '@/features/news/components/NewsLead';
import { arrangeNewsFront, moreNewsLabel } from '@/features/news/news-content';
import type { NewsSection } from '@/lib/public-news/schemas';
import { NewsEventsBand } from '../NewsEventsBand/NewsEventsBand';
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
                <KkNewsRowList>
                  {front.following.map((post) => (
                    <NewsRow key={post.slug} post={post} />
                  ))}
                </KkNewsRowList>
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
