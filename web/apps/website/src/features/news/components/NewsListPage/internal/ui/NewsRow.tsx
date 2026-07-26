import { kkTokens } from '@furria/ui';
import CardActionArea from '@mui/material/CardActionArea';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { NewsCategoryChip } from '@/features/news/components/NewsCategoryChip';
import { NewsMedia } from '@/features/news/components/NewsMedia';
import type { NewsPost } from '@/features/news/news-content';
import { buildPostHref } from '@/features/news/news-content';
import { formatLongDate, formatShortDate } from '@/lib/date';

interface NewsRowProps {
  post: NewsPost;
}

export const NewsRow: FC<NewsRowProps> = ({ post }) => (
  <CardActionArea
    data-kk-news-row
    component={Link}
    to={buildPostHref(post.slug)}
    sx={(theme) => ({
      borderRadius: `${kkTokens.radius.base}px`,
      p: { xs: 2, md: 2.5 },
      transition: theme.transitions.create(['background-color'], {
        duration: theme.transitions.duration.shortest,
      }),
      '&:hover': {
        bgcolor: 'background.paper',
        '& [data-kk-news-row-title]': { color: 'primary.main' },
      },
      '&.Mui-focusVisible': {
        outlineWidth: 2,
        outlineStyle: 'solid',
        outlineColor: (theme.vars ?? theme).palette.primary.main,
        outlineOffset: 2,
      },
    })}
  >
    <Stack direction="row" sx={{ width: '100%', gap: { xs: 2, md: 3 }, alignItems: 'flex-start' }}>
      <Typography
        component="span"
        sx={{
          display: { xs: 'none', md: 'block' },
          fontFamily: kkTokens.font.display,
          color: 'primary.main',
          fontSize: '1.875rem',
          lineHeight: 1,
          flexShrink: 0,
          minWidth: '4.5rem',
        }}
      >
        {formatShortDate(post.publishedAt)}
      </Typography>
      <Stack sx={{ gap: { xs: 0.75, md: 1 }, minWidth: 0, flexGrow: 1 }}>
        <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <NewsCategoryChip category={post.category} />
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            {formatLongDate(post.publishedAt)}
          </Typography>
        </Stack>
        <Typography
          variant="h4"
          component="h3"
          data-kk-news-row-title
          sx={(theme) => ({
            fontSize: { xs: '1.25rem', md: '1.875rem' },
            lineHeight: 1.05,
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
            maxWidth: '40rem',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            overflow: 'hidden',
          }}
        >
          {post.teaser}
        </Typography>
      </Stack>
      <NewsMedia
        post={post}
        sx={{
          flexShrink: 0,
          width: { xs: '4.5rem', md: '10.5rem' },
          height: { xs: '4.5rem', md: '6.5rem' },
          fontSize: { xs: '0.8125rem', md: '1.375rem' },
          border: 1,
          borderColor: 'divider',
          borderRadius: `${kkTokens.radius.base}px`,
        }}
      />
    </Stack>
  </CardActionArea>
);
