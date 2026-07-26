import { kkTokens } from '@furria/ui';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { NewsMedia } from '@/features/news/components/NewsMedia';
import { NewsSectionRule } from '@/features/news/components/NewsSectionRule';
import {
  moreNewsLabel,
  NEWS_POSTS,
  selectFollowingPosts,
  selectLeadPost,
} from '@/features/news/news-content';
import { NewsAufmacher } from '../NewsAufmacher/NewsAufmacher';
import { NewsPageHead } from './internal/layout/NewsPageHead';
import { NewsPageTitleColumn } from './internal/layout/NewsPageTitleColumn';
import { NewsRowList } from './internal/layout/NewsRowList';
import { NewsPageEyebrow } from './internal/ui/NewsPageEyebrow';
import { NewsPageHeadline } from './internal/ui/NewsPageHeadline';
import { NewsPageIntro } from './internal/ui/NewsPageIntro';
import { NewsRow } from './internal/ui/NewsRow';

export const NewsListPage: FC = () => {
  const leadPost = selectLeadPost(NEWS_POSTS);
  const followingPosts = selectFollowingPosts(NEWS_POSTS);

  return (
    <Stack component="main" sx={{ flex: 1 }}>
      <Container maxWidth="xl" sx={{ px: kkTokens.layout.gutterX, py: kkTokens.layout.gutterY }}>
        <Stack sx={{ gap: { xs: 4, md: 6 } }}>
          <NewsPageHead>
            <NewsPageTitleColumn>
              <NewsPageEyebrow />
              <NewsPageHeadline />
            </NewsPageTitleColumn>
            <NewsPageIntro />
          </NewsPageHead>
          <Divider sx={{ borderBottomWidth: 3, borderColor: 'text.primary' }} />
          {leadPost !== undefined && (
            <NewsAufmacher>
              <NewsAufmacher.MediaColumn>
                <NewsMedia
                  post={leadPost}
                  sx={{
                    aspectRatio: kkTokens.aspectRatio.banner,
                    fontSize: { xs: '1.75rem', md: '3.375rem' },
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
          )}
          <Stack component="section" data-kk-news-list sx={{ gap: { xs: 3, md: 4 } }}>
            <NewsSectionRule label={moreNewsLabel} />
            <NewsRowList>
              {followingPosts.map((post) => (
                <NewsRow key={post.slug} post={post} />
              ))}
            </NewsRowList>
          </Stack>
        </Stack>
      </Container>
    </Stack>
  );
};
