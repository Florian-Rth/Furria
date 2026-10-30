import AvTimerRoundedIcon from '@mui/icons-material/AvTimerRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import KeyboardRoundedIcon from '@mui/icons-material/KeyboardRounded';
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
  | 'countIn'
  | 'video'
  | 'videoOff'
  | 'close'
  | 'keys';

export const HALL_GLYPHS: Record<KkHallGlyph, ReactNode> = {
  back: <SkipPreviousRoundedIcon aria-hidden fontSize="medium" />,
  play: <PlayArrowRoundedIcon aria-hidden fontSize="large" />,
  pause: <PauseRoundedIcon aria-hidden fontSize="large" />,
  next: <SkipNextRoundedIcon aria-hidden fontSize="medium" />,
  loop: <RepeatOneRoundedIcon aria-hidden fontSize="medium" />,
  tempo: <SpeedRoundedIcon aria-hidden fontSize="medium" />,
  countIn: <AvTimerRoundedIcon aria-hidden fontSize="medium" />,
  video: <VideocamRoundedIcon aria-hidden fontSize="medium" />,
  videoOff: <VideocamOffRoundedIcon aria-hidden fontSize="medium" />,
  close: <CloseRoundedIcon aria-hidden fontSize="medium" />,
  keys: <KeyboardRoundedIcon aria-hidden fontSize="medium" />,
};
