import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { useState } from 'react';
import { focusRing } from '../internal/focus-ring';
import { KkIcon } from '../KkIcon';
import { kkTokens } from '../tokens';
import { LOUPE_CONTROL_ATTRIBUTE } from './use-loupe-gestures';

const { gallery, overlay } = kkTokens;
const control = { [LOUPE_CONTROL_ATTRIBUTE]: '' };
const PLAY_DISC = 72;

interface KkLoupeFilmProps {
  source: string;
  poster: string;
  duration: string;
  playLabel: string;
}

export const KkLoupeFilm: FC<KkLoupeFilmProps> = ({ source, poster, duration, playLabel }) => {
  const [rolling, setRolling] = useState(false);

  const roll = (): void => {
    setRolling(true);
  };

  if (rolling) {
    return (
      <Box
        component="video"
        {...control}
        src={source}
        poster={poster}
        controls
        autoPlay
        playsInline
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          backgroundColor: gallery.darkroom,
        }}
      />
    );
  }

  return (
    <ButtonBase
      {...control}
      aria-label={`${playLabel}, ${duration}`}
      onClick={roll}
      sx={(theme: Theme) => ({
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        rowGap: 1,
        color: overlay.onPhotoText,
        borderRadius: `${kkTokens.radius.base}px`,
        p: 1,
        ...focusRing(theme),
      })}
    >
      <Box
        sx={{
          display: 'grid',
          placeItems: 'center',
          width: PLAY_DISC,
          height: PLAY_DISC,
          borderRadius: '50%',
          bgcolor: gallery.scrim,
          border: `${kkTokens.line.section}px solid`,
          borderColor: 'warning.main',
          transition: 'transform 180ms ease-out',
          '*:hover > &': { transform: 'scale(1.06)' },
        }}
      >
        <KkIcon name="play" size="large" />
      </Box>
      <Typography variant="h3" component="span">
        {duration}
      </Typography>
    </ButtonBase>
  );
};
