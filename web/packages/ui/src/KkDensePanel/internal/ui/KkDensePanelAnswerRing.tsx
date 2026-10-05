import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { applyScheme, schemeEdge } from '../../../internal/scheme-paint';
import { tonePaint, toneSelectedPaint } from '../../../internal/tone';
import { kkTokens } from '../../../tokens';

const RING_SIZE = '1.25rem';
const PRESS_SCALE = 0.9;
const CIRCLE = '[data-kk-answer-ring-circle]';

const buttonPaint = (theme: Theme): CSSObject => ({
  width: kkTokens.tapTarget,
  height: kkTokens.tapTarget,
  flexShrink: 0,
  borderRadius: '50%',
  transition: kkTokens.motion.press,
  ...focusRing(theme),
  '&:active': { transform: `scale(${PRESS_SCALE})` },
  [`&[aria-expanded="true"] ${CIRCLE}`]: {
    ...toneSelectedPaint(theme, 'gold'),
    borderStyle: 'solid',
  },
  '@media (hover: hover)': {
    [`&:hover ${CIRCLE}`]: {
      ...tonePaint(theme, 'gold'),
      borderStyle: 'solid',
    },
  },
});

const circlePaint = (theme: Theme): CSSObject => ({
  display: 'block',
  width: RING_SIZE,
  height: RING_SIZE,
  borderRadius: '50%',
  borderWidth: kkTokens.line.hair,
  borderStyle: 'dashed',
  ...applyScheme(theme, schemeEdge(kkTokens.color.light.goldInk, kkTokens.color.dark.goldInk)),
});

interface KkDensePanelAnswerRingProps {
  label: string;
  expanded: boolean;
  controls: string;
  onToggle: () => void;
}

export const KkDensePanelAnswerRing: FC<KkDensePanelAnswerRingProps> = ({
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
    data-kk-answer-ring
    sx={buttonPaint}
  >
    <Box component="span" aria-hidden data-kk-answer-ring-circle sx={circlePaint} />
  </ButtonBase>
);
