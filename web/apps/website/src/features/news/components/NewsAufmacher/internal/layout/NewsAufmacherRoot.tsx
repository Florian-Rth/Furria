import { kkTokens } from '@furria/ui';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Grid from '@mui/material/Grid';
import { Link } from '@tanstack/react-router';
import type { FC, PropsWithChildren } from 'react';
import { buildPostHref } from '@/features/news/news-content';
import { NewsAufmacherFlag } from '../ui/NewsAufmacherFlag';

interface NewsAufmacherRootProps extends PropsWithChildren {
  slug: string;
}

export const NewsAufmacherRoot: FC<NewsAufmacherRootProps> = ({ slug, children }) => (
  <Card
    data-kk-news-aufmacher
    sx={(theme) => ({
      overflow: 'hidden',
      boxShadow: kkTokens.shadow.raised,
      '&:has(.Mui-focusVisible)': {
        outlineWidth: 2,
        outlineStyle: 'solid',
        outlineColor: (theme.vars ?? theme).palette.primary.main,
        outlineOffset: 2,
      },
    })}
  >
    <CardActionArea
      component={Link}
      to={buildPostHref(slug)}
      sx={(theme) => ({
        position: 'relative',
        transition: theme.transitions.create(['transform'], {
          duration: theme.transitions.duration.shortest,
        }),
        '&:hover': {
          transform: 'translateY(-2px)',
          '& [data-kk-news-aufmacher-title]': { color: 'primary.main' },
        },
      })}
    >
      <NewsAufmacherFlag />
      <Grid container>{children}</Grid>
    </CardActionArea>
  </Card>
);
