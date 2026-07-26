import { kkTokens } from '@furria/ui';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { NewsMedia } from '@/features/news/components/NewsMedia';
import { NewsSectionRule } from '@/features/news/components/NewsSectionRule';
import type { NewsPost } from '@/features/news/news-content';
import { moreNewsLabel, selectFollowingPosts, selectLeadPost } from '@/features/news/news-content';
import { NewsAufmacher } from '../NewsAufmacher/NewsAufmacher';
import { NewsProgramBand } from '../NewsProgramBand/NewsProgramBand';
import { NewsPageHead } from './internal/layout/NewsPageHead';
import { NewsPageTitleColumn } from './internal/layout/NewsPageTitleColumn';
import { NewsRowList } from './internal/layout/NewsRowList';
import { NewsEmptyPanel } from './internal/ui/NewsEmptyPanel';
import { NewsListFooter } from './internal/ui/NewsListFooter';
import { NewsPageEyebrow } from './internal/ui/NewsPageEyebrow';
import { NewsPageHeadline } from './internal/ui/NewsPageHeadline';
import { NewsPageWatermark } from './internal/ui/NewsPageWatermark';
import { NewsRow } from './internal/ui/NewsRow';

interface NewsListPageProps {
  posts: NewsPost[];
}

export const NewsListPage: FC<NewsListPageProps> = ({ posts }) => {
  const leadPost = selectLeadPost(posts);
  const followingPosts = selectFollowingPosts(posts);

  return (
    <Stack component="main" sx={{ flex: 1 }}>
      <Container maxWidth="xl" sx={{ px: kkTokens.layout.gutterX, py: kkTokens.layout.gutterY }}>
        <Stack sx={{ gap: { xs: 4, md: 6 } }}>
          <NewsPageHead>
            <NewsPageWatermark />
            <NewsPageTitleColumn>
              <NewsPageEyebrow />
              <NewsPageHeadline />
            </NewsPageTitleColumn>
          </NewsPageHead>
          <Divider sx={{ borderBottomWidth: 3, borderColor: 'text.primary' }} />
          {leadPost === undefined ? (
            <NewsEmptyPanel />
          ) : (
            <>
              <NewsAufmacher post={leadPost}>
                <NewsAufmacher.MediaColumn>
                  <NewsMedia
                    post={leadPost}
                    sx={{
                      aspectRatio: { xs: kkTokens.aspectRatio.banner, md: 'auto' },
                      minHeight: { md: '16rem' },
                      fontSize: { xs: '1.75rem', md: '3.375rem' },
                      borderStartStartRadius: `${kkTokens.radius.base}px`,
                      borderStartEndRadius: { xs: `${kkTokens.radius.base}px`, md: 0 },
                      borderEndStartRadius: { xs: 0, md: `${kkTokens.radius.base}px` },
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
              {followingPosts.length > 0 && (
                <Stack component="section" data-kk-news-list sx={{ gap: { xs: 3, md: 4 } }}>
                  <NewsSectionRule label={moreNewsLabel} />
                  <NewsRowList>
                    {followingPosts.map((post) => (
                      <NewsRow key={post.slug} post={post} />
                    ))}
                  </NewsRowList>
                </Stack>
              )}
              <NewsListFooter posts={posts} reference={new Date()} />
            </>
          )}
        </Stack>
      </Container>
      <NewsProgramBand />
    </Stack>
  );
};
