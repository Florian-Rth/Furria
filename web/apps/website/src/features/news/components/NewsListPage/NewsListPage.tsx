import { KkRule, KkSection, PageLayout } from '@furria/ui';
import type { FC } from 'react';
import { NewsHeader } from '@/features/news/components/NewsHeader/NewsHeader';
import { NewsLead } from '@/features/news/components/NewsLead';
import type { NewsPost } from '@/features/news/news-content';
import { moreNewsLabel, selectFollowingPosts, selectLeadPost } from '@/features/news/news-content';
import { NewsEventsBand } from '../NewsEventsBand/NewsEventsBand';
import { NewsRowList } from './internal/layout/NewsRowList';
import { NewsEmptyPanel } from './internal/ui/NewsEmptyPanel';
import { NewsListFooter } from './internal/ui/NewsListFooter';
import { NewsRow } from './internal/ui/NewsRow';

interface NewsListPageProps {
  posts: NewsPost[];
}

export const NewsListPage: FC<NewsListPageProps> = ({ posts }) => {
  const leadPost = selectLeadPost(posts);
  const followingPosts = selectFollowingPosts(posts);

  return (
    <PageLayout>
      <PageLayout.Body>
        <NewsHeader />
        <KkRule />
        {leadPost === undefined ? (
          <NewsEmptyPanel />
        ) : (
          <>
            <NewsLead post={leadPost} />
            <KkSection>
              {followingPosts.length > 0 && (
                <>
                  <KkSection.Header title={moreNewsLabel} />
                  <NewsRowList>
                    {followingPosts.map((post) => (
                      <NewsRow key={post.slug} post={post} />
                    ))}
                  </NewsRowList>
                </>
              )}
              <NewsListFooter posts={posts} reference={new Date()} />
            </KkSection>
          </>
        )}
      </PageLayout.Body>
      <NewsEventsBand />
    </PageLayout>
  );
};
