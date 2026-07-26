import { KkRule, KkSection, kkTokens, PageLayout } from '@furria/ui';
import type { FC } from 'react';
import { NewsHeader } from '@/features/news/components/NewsHeader/NewsHeader';
import { NewsMedia } from '@/features/news/components/NewsMedia';
import type { NewsPost } from '@/features/news/news-content';
import { moreNewsLabel, selectFollowingPosts, selectLeadPost } from '@/features/news/news-content';
import { NewsAufmacher } from '../NewsAufmacher/NewsAufmacher';
import { NewsProgramBand } from '../NewsProgramBand/NewsProgramBand';
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
            <NewsAufmacher post={leadPost}>
              <NewsAufmacher.MediaColumn>
                <NewsMedia
                  post={leadPost}
                  sx={{
                    aspectRatio: kkTokens.aspectRatio.banner,
                    fontSize: { xs: '1.75rem', md: '3.375rem' },
                    border: kkTokens.line.hair,
                    borderColor: 'divider',
                    borderRadius: `${kkTokens.radius.base}px`,
                  }}
                />
              </NewsAufmacher.MediaColumn>
              <NewsAufmacher.TextColumn>
                <NewsAufmacher.Meta post={leadPost} />
                <NewsAufmacher.Headline post={leadPost} />
                <NewsAufmacher.Teaser post={leadPost} />
                <NewsAufmacher.Footer post={leadPost} />
              </NewsAufmacher.TextColumn>
            </NewsAufmacher>
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
      <NewsProgramBand />
    </PageLayout>
  );
};
