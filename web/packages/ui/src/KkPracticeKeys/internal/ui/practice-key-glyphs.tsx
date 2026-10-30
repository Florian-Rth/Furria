import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import SkipPreviousRoundedIcon from '@mui/icons-material/SkipPreviousRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import type { ReactNode } from 'react';

export type KkPracticeKeyGlyph = 'back' | 'forward' | 'tempo' | 'video' | 'play' | 'pause';

export const PRACTICE_KEY_GLYPHS: Record<KkPracticeKeyGlyph, ReactNode> = {
  back: <SkipPreviousRoundedIcon aria-hidden />,
  forward: <SkipNextRoundedIcon aria-hidden />,
  tempo: <SpeedRoundedIcon aria-hidden />,
  video: <VideocamRoundedIcon aria-hidden />,
  play: <PlayArrowRoundedIcon aria-hidden fontSize="large" />,
  pause: <PauseRoundedIcon aria-hidden fontSize="large" />,
};
