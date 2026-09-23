import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';

interface KkCardTitleProps extends PropsWithChildren {
  clamp?: number;
}

export const KkCardTitle: FC<KkCardTitleProps> = ({ clamp, children }) => (
  <Typography
    variant="h4"
    component="h3"
    data-kk-card-title
    sx={(theme) => ({
      lineHeight: 1.05,
      transition: theme.transitions.create(['color'], {
        duration: theme.transitions.duration.shortest,
      }),
      ...(clamp === undefined
        ? {}
        : {
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: clamp,
            overflow: 'hidden',
          }),
    })}
  >
    {children}
  </Typography>
);
