import Box from '@mui/material/Box';
import CardActionArea from '@mui/material/CardActionArea';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../kk-sx';
import { kkTokens } from '../../tokens';
import type { KkNewsFit, KkNewsFitted } from './news-fit';
import { fitted } from './news-fit';
import type { KkNewsLink } from './news-link';

export type KkNewsArea = 'lead' | 'row';

interface KkNewsAreaLook {
  borderRadius: string;
  p: number | KkNewsFitted<number>;
}

const areaLook = (fit: KkNewsFit): KkNewsAreaLook => ({
  borderRadius: `${kkTokens.radius.base}px`,
  p: fitted(fit, { xs: 2, md: 2.5 }),
});

const areaSurface = (fit: KkNewsFit): KkSx => areaLook(fit);

const actionSurface =
  (fit: KkNewsFit): KkSx =>
  (theme) => ({
    ...areaLook(fit),
    transition: theme.transitions.create(['background-color'], {
      duration: theme.transitions.duration.shortest,
    }),
    '&:hover': {
      bgcolor: 'action.hover',
      '& [data-kk-news-title]': { color: 'primary.main' },
    },
    '&.Mui-focusVisible': {
      outlineWidth: 2,
      outlineStyle: 'solid',
      outlineColor: (theme.vars ?? theme).palette.primary.main,
      outlineOffset: 2,
    },
  });

interface KkNewsActionAreaProps extends PropsWithChildren {
  area: KkNewsArea;
  link: KkNewsLink | undefined;
  label: string;
  fit: KkNewsFit;
}

export const KkNewsActionArea: FC<KkNewsActionAreaProps> = ({
  area,
  link,
  label,
  fit,
  children,
}) => {
  const marker = { [`data-kk-news-${area}`]: true };

  if (link === undefined) {
    return (
      <Box {...marker} sx={areaSurface(fit)}>
        {children}
      </Box>
    );
  }

  return (
    <CardActionArea
      {...marker}
      component={link.component}
      to={link.to}
      aria-label={label}
      sx={actionSurface(fit)}
    >
      {children}
    </CardActionArea>
  );
};
