import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import SkipPreviousRoundedIcon from '@mui/icons-material/SkipPreviousRounded';
import SlowMotionVideoRoundedIcon from '@mui/icons-material/SlowMotionVideoRounded';
import SwipeVerticalRoundedIcon from '@mui/icons-material/SwipeVerticalRounded';
import TouchAppRoundedIcon from '@mui/icons-material/TouchAppRounded';
import type { ReactNode } from 'react';

export type KkPracticeGlyph = 'play' | 'pause' | 'back' | 'forward' | 'speed' | 'tap' | 'swipe';

export const KK_PRACTICE_GLYPHS: Record<KkPracticeGlyph, ReactNode> = {
  play: <PlayArrowRoundedIcon fontSize="inherit" />,
  pause: <PauseRoundedIcon fontSize="inherit" />,
  back: <SkipPreviousRoundedIcon fontSize="inherit" />,
  forward: <SkipNextRoundedIcon fontSize="inherit" />,
  speed: <SlowMotionVideoRoundedIcon fontSize="inherit" />,
  tap: <TouchAppRoundedIcon fontSize="inherit" />,
  swipe: <SwipeVerticalRoundedIcon fontSize="inherit" />,
};
