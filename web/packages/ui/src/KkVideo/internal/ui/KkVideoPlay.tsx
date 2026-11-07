import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ButtonBase from '@mui/material/ButtonBase';
import type { FC } from 'react';
import { keepGesture, roundKeyPaint } from '../video-key-paint';

interface KkVideoPlayProps {
  playing: boolean;
  label: string;
  onToggle: () => void;
}

export const KkVideoPlay: FC<KkVideoPlayProps> = ({ playing, label, onToggle }) => {
  const icon = playing ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />;

  return (
    <ButtonBase
      aria-label={label}
      title={label}
      onClick={onToggle}
      onPointerDown={keepGesture}
      onPointerUp={keepGesture}
      data-kk-video-play
      sx={roundKeyPaint}
    >
      {icon}
    </ButtonBase>
  );
};
