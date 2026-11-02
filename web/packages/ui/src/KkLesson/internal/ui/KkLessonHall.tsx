import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { KkIcon } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';

const hallPaint = (theme: Theme): CSSObject => ({
  flexShrink: 0,
  width: kkTokens.tapTarget,
  height: kkTokens.tapTarget,
  borderRadius: '50%',
  color: (theme.vars ?? theme).palette.text.secondary,
  transition: kkTokens.motion.press,
  '&:active': { transform: 'scale(0.94)' },
  '@media (hover: hover)': { '&:hover': { color: (theme.vars ?? theme).palette.text.primary } },
  ...focusRing(theme),
});

interface KkLessonHallProps {
  label: string;
  onOpen: () => void;
}

export const KkLessonHall: FC<KkLessonHallProps> = ({ label, onOpen }) => (
  <ButtonBase aria-label={label} title={label} onClick={onOpen} data-kk-lesson-hall sx={hallPaint}>
    <KkIcon name="group" size="medium" />
  </ButtonBase>
);
