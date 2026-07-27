import { kkTokens } from '@furria/ui';
import CardActionArea from '@mui/material/CardActionArea';
import Grid from '@mui/material/Grid';
import { Link } from '@tanstack/react-router';
import type { FC, PropsWithChildren } from 'react';
import type { NewsPost } from '@/features/news/news-content';
import { buildPostHref } from '@/features/news/news-content';

interface NewsAufmacherRootProps extends PropsWithChildren {
  post: NewsPost;
}

export const NewsAufmacherRoot: FC<NewsAufmacherRootProps> = ({ post, children }) => (
  <CardActionArea
    data-kk-news-aufmacher
    component={Link}
    to={buildPostHref(post.slug)}
    aria-label={post.title}
    sx={(theme) => ({
      borderRadius: `${kkTokens.radius.base}px`,
      p: { xs: 2, md: 2.5 },
      transition: theme.transitions.create(['background-color'], {
        duration: theme.transitions.duration.shortest,
      }),
      '&:hover': {
        bgcolor: 'action.hover',
        '& [data-kk-news-aufmacher-title]': { color: 'primary.main' },
      },
      '&.Mui-focusVisible': {
        outlineWidth: 2,
        outlineStyle: 'solid',
        outlineColor: (theme.vars ?? theme).palette.primary.main,
        outlineOffset: 2,
      },
    })}
  >
    <Grid container spacing={{ xs: 3, md: 6 }} sx={{ width: '100%', alignItems: 'center' }}>
      {children}
    </Grid>
  </CardActionArea>
);
