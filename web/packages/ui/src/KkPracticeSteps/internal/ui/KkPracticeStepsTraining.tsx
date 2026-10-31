import SportsRoundedIcon from '@mui/icons-material/SportsRounded';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

interface KkPracticeStepsTrainingProps {
  text: string;
  onStart: () => void;
}

export const KkPracticeStepsTraining: FC<KkPracticeStepsTrainingProps> = ({ text, onStart }) => (
  <ButtonBase
    onClick={onStart}
    data-kk-practice-steps-training
    sx={(theme) => ({
      flexShrink: 0,
      gap: 0.75,
      minHeight: kkTokens.tapTarget,
      px: 1.5,
      borderRadius: `${kkTokens.radius.pill}px`,
      color: (theme.vars ?? theme).palette.primary.main,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${(theme.vars ?? theme).palette.divider}`,
      '&:active': { transform: 'scale(0.97)' },
      transition: kkTokens.motion.press,
      ...focusRing(theme),
    })}
  >
    <SportsRoundedIcon aria-hidden fontSize="small" />
    <Typography variant="button" component="span" noWrap>
      {text}
    </Typography>
  </ButtonBase>
);
