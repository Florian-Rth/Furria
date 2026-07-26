import { kkTokens } from '@furria/ui';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Stack from '@mui/material/Stack';
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
  <Card
    data-kk-news-card
    sx={[
      (theme) => ({
        height: '100%',
        overflow: 'hidden',
        transition: theme.transitions.create(['transform', 'box-shadow'], {
          duration: theme.transitions.duration.shortest,
        }),
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: kkTokens.shadow.raised,
          '& [data-kk-news-card-title]': { color: 'primary.main' },
        },
        '&:has(.Mui-focusVisible)': {
          outlineWidth: 2,
          outlineStyle: 'solid',
          outlineColor: (theme.vars ?? theme).palette.primary.main,
          outlineOffset: 2,
        },
      }),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <CardActionArea
      component={Link}
      to={buildPostHref(post.slug)}
      aria-label={post.title}
      sx={{ height: '100%' }}
    >
      <Stack direction={{ xs: 'row', md: 'column' }} sx={{ height: '100%' }}>
        <NewsMedia
          post={post}
          sx={{
            flexShrink: 0,
            alignSelf: 'stretch',
            width: { xs: '5.5rem', md: '100%' },
            height: { xs: 'auto', md: '8.25rem' },
            minHeight: '5.5rem',
            fontSize: { xs: '0.9375rem', md: '1.5rem' },
          }}
        />
        <Stack
          sx={{
            flexGrow: 1,
            minWidth: 0,
            gap: { xs: 0.75, md: 1 },
            px: { xs: 1.75, md: 2.25 },
            py: { xs: 1.5, md: 2 },
          }}
        >
          <Stack direction="row" sx={{ gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <NewsCategoryChip category={post.category} />
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, letterSpacing: '0.04em', color: 'text.secondary' }}
            >
              {formatShortDate(post.publishedAt)}
            </Typography>
          </Stack>
          <Typography
            variant="h5"
            component="h3"
            data-kk-news-card-title
            sx={(theme) => ({
              fontSize: { xs: '1.125rem', md: '1.375rem' },
              lineHeight: 1.05,
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 3,
              overflow: 'hidden',
              transition: theme.transitions.create(['color'], {
                duration: theme.transitions.duration.shortest,
              }),
            })}
          >
            {post.title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              textWrap: 'pretty',
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
              overflow: 'hidden',
            }}
          >
            {post.teaser}
          </Typography>
        </Stack>
      </Stack>
    </CardActionArea>
  </Card>
);
