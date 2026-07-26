import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { NewsCard } from '@/features/news/components/NewsCard';
import { NewsSectionRule } from '@/features/news/components/NewsSectionRule';
import { moreNewsLabel, NEWS_POSTS, selectRelatedPosts } from '@/features/news/news-content';
import { NewsRelatedGrid } from './internal/layout/NewsRelatedGrid';

interface NewsRelatedProps {
  currentSlug: string;
}

const COMPACT_VISIBLE_COUNT = 2;

export const NewsRelated: FC<NewsRelatedProps> = ({ currentSlug }) => {
  const relatedPosts = selectRelatedPosts(NEWS_POSTS, currentSlug);

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <Stack component="section" data-kk-news-related sx={{ gap: { xs: 3, md: 4 } }}>
      <NewsSectionRule label={moreNewsLabel} />
      <NewsRelatedGrid>
        {relatedPosts.map((post, index) => (
          <Grid
            key={post.slug}
            size={{ xs: 12, md: 4 }}
            sx={{
              display: index < COMPACT_VISIBLE_COUNT ? 'block' : { xs: 'none', md: 'block' },
            }}
          >
            <NewsCard post={post} />
          </Grid>
        ))}
      </NewsRelatedGrid>
    </Stack>
  );
};
