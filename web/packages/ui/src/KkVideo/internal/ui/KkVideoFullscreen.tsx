import FullscreenExitRoundedIcon from '@mui/icons-material/FullscreenExitRounded';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';
import ButtonBase from '@mui/material/ButtonBase';
import type { FC } from 'react';
import type { KkFullscreen } from '../../../use-kk-fullscreen';
import { keepGesture, roundKeyPaint } from '../video-key-paint';

interface KkVideoFullscreenProps {
  fullscreen: KkFullscreen;
  enterLabel: string;
  exitLabel: string;
}

export const KkVideoFullscreen: FC<KkVideoFullscreenProps> = ({
  fullscreen,
  enterLabel,
  exitLabel,
}) => {
  const label = fullscreen.active ? exitLabel : enterLabel;
  const icon = fullscreen.active ? <FullscreenExitRoundedIcon /> : <FullscreenRoundedIcon />;

  return (
    <ButtonBase
      aria-label={label}
      title={label}
      onClick={fullscreen.toggle}
      onPointerDown={keepGesture}
      onPointerUp={keepGesture}
      data-kk-video-fullscreen
      sx={roundKeyPaint}
    >
      {icon}
    </ButtonBase>
  );
};
