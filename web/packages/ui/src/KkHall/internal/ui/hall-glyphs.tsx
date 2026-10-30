import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import RepeatOneRoundedIcon from '@mui/icons-material/RepeatOneRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import SkipPreviousRoundedIcon from '@mui/icons-material/SkipPreviousRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import VideocamOffRoundedIcon from '@mui/icons-material/VideocamOffRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import type { ReactNode } from 'react';

export type KkHallGlyph =
  | 'back'
  | 'play'
  | 'pause'
  | 'next'
  | 'loop'
  | 'tempo'
  | 'video'
  | 'videoOff'
  | 'close';

export const HALL_GLYPHS: Record<KkHallGlyph, ReactNode> = {
  back: <SkipPreviousRoundedIcon fontSize="medium" />,
  play: <PlayArrowRoundedIcon fontSize="large" />,
  pause: <PauseRoundedIcon fontSize="large" />,
  next: <SkipNextRoundedIcon fontSize="medium" />,
  loop: <RepeatOneRoundedIcon fontSize="medium" />,
  tempo: <SpeedRoundedIcon fontSize="medium" />,
  video: <VideocamRoundedIcon fontSize="medium" />,
  videoOff: <VideocamOffRoundedIcon fontSize="medium" />,
  close: <CloseRoundedIcon fontSize="medium" />,
};
