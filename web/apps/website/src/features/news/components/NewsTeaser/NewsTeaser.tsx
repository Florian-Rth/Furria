import { KkSection, kkTokens } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import { SectionActionLink } from '@/components/SectionActionLink';
import { NewsCard } from '@/features/news/components/NewsCard';
import { useTeaserPosts } from '@/features/news/hooks/use-teaser-posts';
import { allNewsLabel, newsHeading } from '@/features/news/news-content';
import { NewsTeaserGrid } from './internal/layout/NewsTeaserGrid';

export const NewsTeaser: FC = () => {
  const teaserPosts = useTeaserPosts();

  if (teaserPosts.length === 0) {
    return null;
  }

  return (
    <KkSection>
      <KkSection.Header
        title={newsHeading}
        action={<SectionActionLink to="/news">{allNewsLabel}</SectionActionLink>}
      />
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
    </KkSection>
  );
};
