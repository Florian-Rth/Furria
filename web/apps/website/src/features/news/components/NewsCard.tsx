import { KkCard } from '@furria/ui';
import type { SxProps, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { NewsCategoryChip } from '@/features/news/components/NewsCategoryChip';
import { NewsMedia } from '@/features/news/components/NewsMedia';
import type { NewsPost } from '@/features/news/news-content';
import { buildPostHref } from '@/features/news/news-content';
import { formatShortDate } from '@/lib/date';

interface NewsCardProps {
  post: NewsPost;
  sx?: SxProps<Theme>;
}

export const NewsCard: FC<NewsCardProps> = ({ post, sx }) => (
  <KkCard sx={sx}>
    <KkCard.Action component={Link} to={buildPostHref(post.slug)} aria-label={post.title}>
      <KkCard.Media>
        <NewsMedia post={post} sx={{ height: '100%', typography: { xs: 'h3', md: 'h2' } }} />
      </KkCard.Media>
      <KkCard.Body>
        <KkCard.Meta>
          <NewsCategoryChip category={post.category} />
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, letterSpacing: '0.04em', color: 'text.secondary' }}
          >
            {formatShortDate(post.publishedAt)}
          </Typography>
        </KkCard.Meta>
        <KkCard.Title clamp={3}>{post.title}</KkCard.Title>
        <KkCard.Text clamp={2}>{post.teaser}</KkCard.Text>
      </KkCard.Body>
    </KkCard.Action>
  </KkCard>
);
