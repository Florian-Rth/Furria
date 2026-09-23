import { KkRule, KkSection, kkTokens, PageLayout } from '@furria/ui';
import type { FC } from 'react';
import { NewsHeader } from '@/features/news/components/NewsHeader/NewsHeader';
import { NewsMedia } from '@/features/news/components/NewsMedia';
import type { NewsPost } from '@/features/news/news-content';
import { moreNewsLabel, selectFollowingPosts, selectLeadPost } from '@/features/news/news-content';
import { NewsEventsBand } from '../NewsEventsBand/NewsEventsBand';
import { NewsLead } from '../NewsLead/NewsLead';
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
            <NewsLead post={leadPost}>
              <NewsLead.MediaColumn>
                <NewsMedia
                  post={leadPost}
                  sx={{
                    aspectRatio: kkTokens.aspectRatio.banner,
                    typography: { xs: 'h1', md: 'display' },
                    border: kkTokens.line.hair,
                    borderColor: 'divider',
                    borderRadius: `${kkTokens.radius.base}px`,
                  }}
                />
              </NewsLead.MediaColumn>
              <NewsLead.TextColumn>
                <NewsLead.Meta post={leadPost} />
                <NewsLead.Headline post={leadPost} />
                <NewsLead.Teaser post={leadPost} />
                <NewsLead.Footer post={leadPost} />
              </NewsLead.TextColumn>
            </NewsLead>
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
