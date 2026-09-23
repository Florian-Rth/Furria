import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { Album } from '@/features/gallery/gallery-content';
import { buildAlbumHref, buildAlbumRowMeta } from '@/features/gallery/gallery-content';

interface OlderSessionAlbumLinkProps {
  album: Album;
}

export const OlderSessionAlbumLink: FC<OlderSessionAlbumLinkProps> = ({ album }) => {
  const albumHref = buildAlbumHref(album.slug);
  const rowMeta = buildAlbumRowMeta(album);

  return (
    <ButtonBase
      data-kk-older-session-album
      component={Link}
      to={albumHref}
      sx={(theme) => ({
        justifyContent: 'flex-start',
        textAlign: 'left',
        width: '100%',
        py: 1.25,
        px: 0.5,
        borderRadius: 1,
        '&:hover [data-kk-older-session-album-arrow]': { transform: 'translateX(3px)' },
        '&.Mui-focusVisible': {
          outlineWidth: 2,
          outlineStyle: 'solid',
          outlineColor: (theme.vars ?? theme).palette.primary.main,
          outlineOffset: 2,
        },
      })}
    >
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, width: '100%', minWidth: 0 }}>
        <Stack sx={{ flexGrow: 1, minWidth: 0, gap: 0.25, alignItems: 'flex-start' }}>
          <Typography
            component="span"
            sx={{
              typography: 'body1',
              fontWeight: 800,
              color: 'text.primary',
              overflowWrap: 'anywhere',
            }}
          >
            {album.title}
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, color: 'text.secondary', textWrap: 'pretty' }}
          >
            {rowMeta}
          </Typography>
        </Stack>
        <Typography
          component="span"
          data-kk-older-session-album-arrow
          aria-hidden
          sx={(theme) => ({
            flexShrink: 0,
            fontWeight: 900,
            color: 'primary.main',
            transition: theme.transitions.create(['transform'], {
              duration: theme.transitions.duration.shortest,
            }),
          })}
        >
          →
        </Typography>
      </Stack>
    </ButtonBase>
  );
};
