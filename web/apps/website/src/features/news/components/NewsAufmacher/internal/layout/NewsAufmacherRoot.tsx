import { kkTokens } from '@furria/ui';
import Card from '@mui/material/Card';
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
  <Card
    data-kk-news-aufmacher
    sx={(theme) => ({
      overflow: 'hidden',
      boxShadow: kkTokens.shadow.raised,
      transition: theme.transitions.create(['transform'], {
        duration: theme.transitions.duration.shortest,
      }),
      '&:hover': {
        transform: 'translateY(-2px)',
        '& [data-kk-news-aufmacher-title]': { color: 'primary.main' },
      },
      '&:has(.Mui-focusVisible)': {
        outlineWidth: 2,
        outlineStyle: 'solid',
        outlineColor: (theme.vars ?? theme).palette.primary.main,
        outlineOffset: 2,
      },
    })}
  >
    <CardActionArea component={Link} to={buildPostHref(post.slug)} aria-label={post.title}>
      <Grid container>{children}</Grid>
    </CardActionArea>
  </Card>
);
