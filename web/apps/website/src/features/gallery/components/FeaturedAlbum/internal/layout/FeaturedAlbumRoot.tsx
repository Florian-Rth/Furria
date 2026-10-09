import { kkTokens } from '@furria/ui';
import CardActionArea from '@mui/material/CardActionArea';
import { Link } from '@tanstack/react-router';
import type { FC, PropsWithChildren } from 'react';
import { buildAlbumHref } from '@/features/gallery/gallery-content';
import type { AlbumSummary } from '@/lib/public-gallery/schemas';
import { FeaturedAlbumScrim } from '../ui/FeaturedAlbumScrim';

interface FeaturedAlbumRootProps extends PropsWithChildren {
  album: AlbumSummary;
}

export const FeaturedAlbumRoot: FC<FeaturedAlbumRootProps> = ({ album, children }) => {
  const albumHref = buildAlbumHref(album);

  return (
    <CardActionArea
      data-kk-featured-album
      component={Link}
      to={albumHref}
      aria-label={album.title}
      sx={(theme) => ({
        position: 'relative',
        display: 'block',
        borderRadius: `${kkTokens.radius.base}px`,
        boxShadow: kkTokens.shadow.raised,
        transition: theme.transitions.create(['transform', 'box-shadow'], {
          duration: theme.transitions.duration.shortest,
        }),
        '&:hover': {
          transform: 'translateY(-2px)',
          '& [data-kk-featured-album-action]': { transform: 'translateX(3px)' },
        },
        '&.Mui-focusVisible': {
          outlineWidth: 2,
          outlineStyle: 'solid',
          outlineColor: (theme.vars ?? theme).palette.primary.main,
          outlineOffset: 3,
        },
      })}
    >
      <FeaturedAlbumScrim />
      {children}
    </CardActionArea>
  );
};
