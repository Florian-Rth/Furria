import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { KkIcon } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';
import { LESSON_NARROW } from '../lesson-query';

const hallPaint = (theme: Theme): CSSObject => ({
  flexShrink: 0,
  flexDirection: 'column',
  gap: theme.spacing(0.25),
  height: kkTokens.tapTarget,
  minWidth: kkTokens.tapTarget,
  paddingInline: theme.spacing(0.75),
  borderRadius: `${kkTokens.radius.bar * 3}px`,
  color: (theme.vars ?? theme).palette.text.secondary,
  transition: kkTokens.motion.press,
  '&:active': { transform: 'scale(0.95)' },
  '&:hover': { color: (theme.vars ?? theme).palette.text.primary },
  [LESSON_NARROW]: { '& [data-kk-lesson-hall-text]': { display: 'none' } },
  ...focusRing(theme),
});

interface KkLessonHallProps {
  text: string;
  label: string;
  onOpen: () => void;
}

export const KkLessonHall: FC<KkLessonHallProps> = ({ text, label, onOpen }) => (
  <ButtonBase aria-label={label} onClick={onOpen} data-kk-lesson-hall sx={hallPaint}>
    <KkIcon name="group" size="small" />
    <Typography
      component="span"
      variant="caption"
      data-kk-lesson-hall-text
      sx={{ fontWeight: 800, lineHeight: 1, color: 'inherit', whiteSpace: 'nowrap' }}
    >
      {text}
    </Typography>
  </ButtonBase>
);
