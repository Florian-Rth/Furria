import { kkTokens } from '@furria/ui';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { NewsCard } from '@/features/news/components/NewsCard';
import { NEWS_POSTS, selectTeaserPosts } from '@/features/news/news-content';
import { NewsTeaserGrid } from './internal/layout/NewsTeaserGrid';
import { NewsTeaserHeader } from './internal/layout/NewsTeaserHeader';
import { NewsTeaserAllLink } from './internal/ui/NewsTeaserAllLink';
import { NewsTeaserHeading } from './internal/ui/NewsTeaserHeading';

export const NewsTeaser: FC = () => {
  const teaserPosts = selectTeaserPosts(NEWS_POSTS);

  if (teaserPosts.length === 0) {
    return null;
  }

  return (
    <Stack component="section" data-kk-news-teaser sx={{ gap: { xs: 3, md: 4 } }}>
      <NewsTeaserHeader>
        <NewsTeaserHeading />
        <NewsTeaserAllLink />
      </NewsTeaserHeader>
      <NewsTeaserGrid>
        {teaserPosts.map((post, index) => (
          <Grid key={post.slug} size={{ xs: 12, md: 4 }}>
            <NewsCard
              post={post}
              sx={index === 0 ? { boxShadow: kkTokens.shadow.raised } : undefined}
            />
          </Grid>
        ))}
      </NewsTeaserGrid>
    </Stack>
  );
};
