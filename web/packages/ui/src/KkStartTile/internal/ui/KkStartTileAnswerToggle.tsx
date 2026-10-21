import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { applyScheme } from '../../../internal/scheme-paint';
import { kkTokens } from '../../../tokens';
import { controlFocus, goldGround, goldInkScheme, owedRing } from '../tile-paint';

const PRESS_SCALE = 0.9;
const OPEN_SCALE = 1.15;
const HALO = '[data-kk-start-tile-answer-halo]';
const RING = '[data-kk-start-tile-answer-ring]';
const HALO_SIZE = '1.75rem';

const togglePaint = (theme: Theme): CSSObject => ({
  position: 'relative',
  width: kkTokens.tapTarget,
  height: kkTokens.tapTarget,
  flexShrink: 0,
  borderRadius: '50%',
  transition: kkTokens.motion.press,
  ...applyScheme(theme, goldInkScheme),
  ...controlFocus(theme),
  '&:active': { transform: `scale(${PRESS_SCALE})` },
  [`&[aria-expanded="true"] ${HALO}`]: { opacity: 1 },
  [`&[aria-expanded="true"] ${RING}`]: {
    transform: `scale(${OPEN_SCALE})`,
    backgroundColor: 'currentColor',
  },
  '@media (hover: hover)': {
    [`&:hover ${HALO}`]: { opacity: 1 },
  },
});

const haloPaint = (theme: Theme): CSSObject => ({
  position: 'absolute',
  width: HALO_SIZE,
  height: HALO_SIZE,
  borderRadius: '50%',
  opacity: 0,
  transition: kkTokens.motion.label,
  ...goldGround(theme),
});

const ringPaint = (theme: Theme): CSSObject => ({
  ...owedRing(theme),
  position: 'relative',
  transition: kkTokens.motion.label,
});

interface KkStartTileAnswerToggleProps {
  label: string;
  expanded: boolean;
  controls: string;
  onToggle: () => void;
}

export const KkStartTileAnswerToggle: FC<KkStartTileAnswerToggleProps> = ({
  label,
  expanded,
  controls,
  onToggle,
}) => (
  <ButtonBase
    disableRipple
    aria-label={label}
    aria-expanded={expanded}
    aria-controls={controls}
    onClick={onToggle}
    data-kk-start-tile-answer-toggle
    sx={togglePaint}
  >
    <Box component="span" aria-hidden data-kk-start-tile-answer-halo sx={haloPaint} />
    <Box component="span" aria-hidden data-kk-start-tile-answer-ring sx={ringPaint} />
  </ButtonBase>
);
